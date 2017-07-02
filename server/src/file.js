/**
 * @file Handles all filesystem level operations on media files
 */
'use strict';
const Writeable = require('stream').Writable;
const Readable = require('stream').Readable;
const Stream = require('stream');
const Promise = require('bluebird');
const path = require('path');
const os = require('os');
let ffmpeg = require('fluent-ffmpeg');
const walk = require('walk');
const fs = Promise.promisifyAll(require('fs-extra'));
const query = require('./query.js');
let db = require('./db.js')();
let ffprobe = Promise.promisify(ffmpeg.ffprobe);
const ignoredPhrases = [
  'bdrip',
  'brrip',
  '720p',
  '1080p',
  'hdrip',
  'bluray',
  'xvid',
  'divx',
  'dvdscr',
  'dvdrip',
  'readnfo',
  'hdtv',
  'web-dl',
  'extended',
  'webrip',
  'ws',
  'vodrip',
  'ntsc',
  'dvd',
  'dvdscr',
  'hd-ts',
  'r5',
  'unrated'
];

const validExtensions = [
  '.mkv',
  '.avi',
  '.mp4',
  '.ogm',
  '.m4v',
  '.mpg'
];

const ffmpegExe = os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
const ffprobeExe = os.platform() === 'win32' ? 'ffprobe.exe' : 'ffprobe';

ffmpeg.setFfmpegPath(path.join('ffmpeg', os.platform(), 'bin', ffmpegExe));
ffmpeg.setFfprobePath(path.join('ffmpeg', os.platform(), 'bin', ffprobeExe));

/**
 * Takes output from ffprobe and evaluates whether the file is valid
 *
 * @param {string} directory - root directory of file
 * @param {object} metadata - file metadata, such as duration, format
 * @return {object} object with metadata and the extracted filename
 */
let validateAndCleanFFProbeOutput = function(directory, metadata) {
  let filename;

  if (!metadata.format || metadata.duration < 500) {
    throw new Error('Bad file');
  }

  // get rid of the root
  filename = metadata.format.filename.substring(directory.length + 1);
  filename = filename.split(path.sep)[0];
  filename = filename.toLowerCase();

  ignoredPhrases.forEach(function(phrase) {
    let returnValue = filename.split(phrase);
    if (returnValue.length > 1) {
      filename = returnValue[0];
    }
  });

  return { 'metadata': metadata,'filename' : filename };
};

/**
 * Takes a file and creates a database record
 *
 * @param {string} rootDir - root directory of where all files are searched from
 * @param {string} fileName - name of file
 * @param {string} baseDir - base directory of file (file directory)
 * @param {string} category - type of record ('movie' or 'tv')
 * @param {string} collectionName - name of collection to store file under
 * @return {object} a promise that has created a db record for the given file
 */
module.exports.createRecord = (filePath, baseDir, category, collectionName)  => {
  if (validExtensions.indexOf(path.extname(filePath)) === -1) {
    return Promise.reject(new Error('File extension invalid'));
  }

  return db.findFile(filePath)
    .then(filePath => ffprobe(filePath))
    .then(fileMetaData => validateAndCleanFFProbeOutput(baseDir, fileMetaData))
    .then(data => query(data, category, null))
    .then(mediaObject => {
      // We do this so that the test code has a path to inject itself
      mediaObject.db = db;
      return mediaObject.save(collectionName);
    });
};

module.exports.transcode = (file, mediaId, index) => {
  const ffmpegStream  = ffmpeg(file)
    .videoCodec('copy')
    .audioCodec('aac')
    .addOption('-b:a', '200k')
    .addOption('-bsf:v', 'h264_mp4toannexb')
    .addOption('-err_detect', 'ignore_err')
    .addOption('-movflags', 'faststart+frag_keyframe+empty_moov')
    .addOption('-strict', 'experimental')
    .addOption('-f', 'segment')
    .addOption('-segment_time', '4')
    .addOption('-segment_list', 'tmp/' + mediaId + '_' + index + '.m3u8')
    .addOption('-segment_format', 'mpegts')
    .on('progress', function(progress) {
      console.log('Processing: ' + progress.timemark);
    })
    .on('error', function(err, stdout, stderr) {
      console.error(err);
      console.error(stdout);
      console.error(stderr);
      //stream.destroy(err);
    })
    .on('start', function() {
      console.log('Transcoding: ' + file);
    })
    .on('end', function() {
      console.log('im finished!');
    })
    .save('tmp/' + mediaId + '_' + index +'_%05d.ts');
};

module.exports.stats = file => {
  return fs.statAsync(file.filename)
    .then(stats => {
      stats.path = file.filename;
      stats.duration = file.duration;
      return stats;
    });
};

module.exports.indexAllFiles = (collectionName, searchInfo) => {
  let options = {
    followLinks: false
  };
  let directory = searchInfo.directory;
  let category = searchInfo.type;

  const walker = walk.walk(directory, options);

  walker.on('directories', function (root, dirStatsArray, next) {
    next();
  });

  walker.on('file', function (root, fileStats, next) {
    let filePath = path.join(root, fileStats.name);

    module.exports.createRecord(filePath, directory, category, collectionName)
      .finally(function() {
        return next();
      });
  });

  walker.on('errors', function (root, nodeStatsArray, next) {
    return next();
  });

  walker.on('end', function() {
    try {
      db.initDb();
    } catch(ex) {
      console.log(ex);
    }
  });
};

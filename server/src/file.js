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

if (process.env.JSMC_DEV) {
  ffprobe = (filename) => {
    return {
      format:{
        filename: filename
      },
      duration: 10000,
      codecLong: 'AVI',
      codecShort: 'AVI'
    }
  }
}

const ffmpegExe = os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
const ffprobeExe = os.platform() === 'win32' ? 'ffprobe.exe' : 'ffprobe';
const platform = os.platform();
const binaryFfmpeg = platform === 'linux' ? ffmpegExe : path.join('bin', ffmpegExe);
const binaryFfprobe = platform === 'linux' ? ffprobeExe : path.join('bin', ffprobeExe);
ffmpeg.setFfmpegPath(path.join('ffmpeg', platform, binaryFfmpeg));
ffmpeg.setFfprobePath(path.join('ffmpeg', platform, binaryFfprobe));

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

module.exports.extractSubtitle = (file, mediaId, index) => {
  const ffmpegStream = ffmpeg(file)
    .addOption('-map', '0:s:0')
    .on('progress', function(progress) {
      console.log('Processing caption: ' + progress.timemark + ' for ' + file);
    })
    .save('tmp/' + mediaId + '_' + index +'.srt'); 
};

module.exports.captureScreenshot = (file, mediaId, index, timemark) => {
  const ffmpegStream  = ffmpeg(file)
    .addOption('-ss', timemark)
    .addOption('-vframes', '1')
    .addOption('-f', 'mjpeg')
  //  .addOption('-q:v', '2')
    .save('tmp/' + mediaId + '_' + index +'.jpg'); 

  return ffmpegStream;
};

module.exports.transcode = (file, mediaId, index, startTime = 0) => {
  const ffmpegStream  = ffmpeg(file)
    .videoCodec('copy')
    .audioCodec('aac')
    .addOption('-b:a', '200k')
    .addOption('-c:s', 'mov_text')
    .addOption('-bsf:v', 'h264_mp4toannexb')
    .addOption('-movflags', 'faststart+frag_keyframe+empty_moov')
    .addOption('-strict', 'experimental')
    .addOption('-f', 'segment')
    .addOption('-segment_time', '10')
    .addOption('-segment_list', 'tmp/' + mediaId + '_' + index + '.m3u8')
    .addOption('-segment_format', 'mpegts')
    .on('progress', function(progress) {
      console.log('Processing: ' + progress.timemark + ' for ' + file);
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
      console.log('Finished transcoding ' + file);
    })
    .save('tmp/' + mediaId + '_' + index +'_%05d.ts');

    return ffmpegStream;
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

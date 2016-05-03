/**
 * @file Handles all filesystem level operations on media files
 */
"use strict";
const Promise = require('bluebird');
const path = require('path');
const os = require('os');
const ffmpeg = require('fluent-ffmpeg');
const fs = Promise.promisifyAll(require('fs-extra'));
const query = require('./query.js');
const db = require('./db.js')();
const ffprobe = Promise.promisify(ffmpeg.ffprobe);
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
  '.mp4'
];

ffmpeg.setFfmpegPath(path.join('ffmpeg', os.platform(), 'bin','ffmpeg.exe'));
ffmpeg.setFfprobePath(path.join('ffmpeg', os.platform(), 'bin','ffprobe.exe'));

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
module.exports.createRecord = function(rootDir, fileName, baseDir, category, collectionName) {
  let filePath = path.join(rootDir, fileName);

  if (validExtensions.indexOf(path.extname(fileName)) === -1) {
    return Promise.reject(new Error('File extension invalid'));
  }

  return ffprobe(filePath)
    .then(validateAndCleanFFProbeOutput.bind(this, baseDir))
    .then(data => query(data, category, null))
    .then(db.insertQuery.bind(this, collectionName));
};

/**
 * Kicks off process to transcode a file to HLS
 *
 * @param {string} collection - collection file is stored under
 * @param {string} mediaId - database id of a given file
 * @param {integer} fileIndex - file index as set in the database
 * @return {string} location of the transcoded asset
 */
module.exports.transcode = function(collection, mediaId, fileIndex) {
  return fs.existsAsync('tmp/' + mediaId + '_'+ fileIndex + '.m3u8')
    .then(function(exists) {
      if (!exists) {
        db.getMedia(mediaId).then(function(doc) {
          console.log('transcode');
          console.log(doc);
          ffmpeg(doc.filedata[fileIndex].filename)
            .videoCodec('copy')
            .audioCodec('aac')
            .addOption('-b:a', '50k')
            .addOption('-bsf:v', 'h264_mp4toannexb')
            .addOption('-strict', 'experimental')
            .addOption('-f', 'segment')
            .addOption('-segment_time', '4')
            .addOption('-segment_list', 'tmp/' + mediaId + '_' + fileIndex + '.m3u8')
            .addOption('-segment_format', 'mpegts')
            .on('progress', function(progress) {
              console.log('Processing: ' + progress.percent + '% done');
            })
            .on('error', function(err, stdout, stderr) {
              throw err;
              //console.log('Cannot process video: ' + err.message);
            })
            .on('start', function() {
              console.log('Transcoding: ' + doc.filedata[fileIndex].filename);
            })
            .save('tmp/' + mediaId + '_' + fileIndex +'_%05d.ts');
        }).catch(function(error) {
          console.log(error);
        });
      }

      return 'tmp/'+ mediaId + '_' + fileIndex +'.m3u8';
    })
    .catch(function(error) {
      console.log(error);
      return 'tmp/'+ mediaId + '_' + fileIndex +'.m3u8';
    });
};

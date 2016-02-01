"use strict";
const Promise = require('bluebird');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const fs = Promise.promisifyAll(require('fs-extra'));
const query = require('../src/query.js');
const db = require('../src/db.js');
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

ffmpeg.setFfmpegPath(path.join('..','ffmpeg','win','bin','ffmpeg.exe'));
ffmpeg.setFfprobePath(path.join('..','ffmpeg','win','bin','ffprobe.exe'));

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
    var returnValue = filename.split(phrase);
    if (returnValue.length > 1) {
      filename = returnValue[0];
    }
  });

  filename = filename.split('.');
  filename = filename.join('+');
  filename = filename.split('_');
  filename = filename.join('+');
  filename = filename.split(' ');
  filename = filename.join('+');

  return {'metadata': metadata,'filename' : filename};
};

exports.createRecord = function(rootDir, fileName, baseDir, category, collectionName) {
  let filePath = path.join(rootDir, fileName);

  if (validExtensions.indexOf(path.extname(fileName)) === -1) {
    return Promise.reject(new Error('File extension invalid'));
  }

  return ffprobe(filePath)
    .then(validateAndCleanFFProbeOutput.bind(this,baseDir))
    .then(data => query(data, category, null))
    .then(db.insertQuery.bind(this, collectionName));
};

exports.transcode = function(collection, mediaId, fileIndex) {
  return fs.existsAsync('tmp/' + mediaId + '_'+ fileIndex + '.m3u8')
    .then(function(exists) {
      if (!exists) {
        db.getMedia(collection, mediaId).then(function(doc) {
          console.log('transcode');
          console.log(doc);
          ffmpeg(doc.filedata[fileIndex].filename)
            .videoCodec('copy')
            .audioCodec('aac')
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
              console.log('Cannot process video: ' + err.message);
            })
            .on('start', function() {
              console.log('Transcoding: ' + doc.filedata[fileIndex].filename);
            })
            .save('tmp/' + mediaId + '_' + fileIndex +'_%05d.ts');
        });
      }

      return 'tmp/'+ mediaId + '_' + fileIndex +'.m3u8';
    });
};

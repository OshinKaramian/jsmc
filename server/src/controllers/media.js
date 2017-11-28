/**
 * @file Controller for all server operations
 */
'use strict';
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const path = require('path');
const file = require('../file.js');
const Media = require('../media.js');
let db = require('../db.js')();

const buffer = [];

export const transcode = (req, res) => {
    const mediaId = req.params.mediaId;
    const fileIndex = req.params.fileIndex || 0;

    db.getMedia(mediaId).then(doc => {
      return file.stats(doc.filedata[fileIndex])
    })
    .then(stat => {
      //const fileName = path.resolve(path.join('tests', 'files', 'testfile.mkv'));
      const videoStream = file.transcode(stt.path);
      //videoStream.on('finish', () => res.end());
      videoStream.onWrite = (chunk, enc, next) => {
        if (buffer.length === 200) {
          buffer.splice(1,199);
        }
        buffer.push(chunk);
      };

      res.end();
      //req.on('close', () => videoStream.end());
    });

};

export const getSegment = (req, res) => {
  const segmentNumber = req.params.segment;
  res.send(buffer[segmentNumber]);
};
require('dotenv').config();
const express = require('express');
const router = express.Router();

const AWS = require('aws-sdk');
const fs = require('fs');
const mime = require('mime-types');


AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.REGION
});
console.log(process.env.BACKET);
const dir = "./files/"
console.log(dir);
const s3 = new AWS.S3();
fs.readdir(dir, function(err, files){
  if (err) throw err;
  files.filter(function(file){
    const params = {
      Bucket: 'rekognition-mybcket',
      Key: 'images' + file,
      Body: fs.readFileSync(dir + file),
      ContentEncoding: 'base64',
      ContentType: mime.lookup(file)
    };
    s3.putObject(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else console.log(data);
    });
  });
});

module.exports = router;
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const moment = require('moment');
const AWS = require('aws-sdk');
const fs = require('fs');
const mime = require('mime-types');

const S3upload = require('./S3upload');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


const multer = require('multer')

const storage =  multer.diskStorage({
  destination: './files',
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

const uploader = multer({ storage })
app.post('/images', uploader.single('image'), (req, res) => {
  const file = req.file
  const meta = req.body
 
  // デバッグのため、アップしたファイルの名前を表示する
  console.log(file);
  console.log(meta);
  // アップ完了したら200ステータスを送る
  res.status(200).json({msg: 'アップロード完了'})

  require('dotenv').config();
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
        Bucket: process.env.BACKET,//'rekognition-mybcket',
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
    files.forEach(function(file){
      fs.unlink(`${dir}/${file}`, function(err){
        if(err){
          throw(err);
        }
        console.log(`deleted ${file}`);
      });
    });
  });

})
// publicディレクトリからhtmlをサーブする
app.use(express.static('public'))
console.log("kokomade");
//s3uploadを呼び出し
//app.use('/', S3upload);
app.listen(3000, () => console.log('Listening on port 3000'))


//module.exports = app;

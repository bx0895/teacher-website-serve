const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const { maxFileSize } = require('./config')

const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const selectRouter = require('./routes/select');
const deleteRouter = require('./routes/delete');
const updateRouter = require('./routes/update');
const insertRouter = require('./routes/insert');
const uploadRouter = require('./routes/upload');
const keyRouter = require('./routes/key');

const app = express();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(cors({
  "origin": true, //true 设置为 req.origin.url
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE", //容许跨域的请求方式
  "allowedHeaders": "x-requested-with,Authorization,token, content-type", //跨域请求头
  "preflightContinue": false, // 是否通过next() 传递options请求 给后续中间件 
  "maxAge": 1728000, //options预验结果缓存时间 20天
  "credentials": true, //携带cookie跨域
  "optionsSuccessStatus": 200 //options 请求返回状态码
}))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//静态资源
app.use(express.static(path.join(__dirname, 'public')));
//上传路径
app.use(express.static(path.join(__dirname, 'uploads')));

app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/select', selectRouter);
app.use('/delete', deleteRouter);
app.use('/update', updateRouter);
app.use('/insert', insertRouter);
app.use('/upload', uploadRouter);
app.use('/key', keyRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
const ERROR_CODE_MAP = {
  'LIMIT_FILE_SIZE': `文件大小不得超过 ${maxFileSize} bytes`,
  'ER_NO_DEFAULT_FOR_FIELD': '存在必填值为空',
}


const QUE_MAP = {
  "adm_id": "账号",
  "tea_id": "账号",
  "stu_id": "账号",
  "password": "密码",
  "name": "姓名",
  "email": "邮箱",
} 
const ASSERT_ERR_MAP = {
  'ERR_ASSERTION':422
}

// error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page

  if (err.code in ERROR_CODE_MAP) {
    err.status = 422
    err.message = ERROR_CODE_MAP[err.code]
  }

  if (err.code in ASSERT_ERR_MAP) {
    err.status = 422
  }

  console.log(err)
  res.status(err.status || 500).send({
    code: err.status,
    message: err.message
  });
  // res.render('error');
})

module.exports = app;

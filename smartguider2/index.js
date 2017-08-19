var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


// 이미지 업로드
var multer = require('multer');


require('./lib/connection');
var spots = require('./routes/spots');
var sights = require('./routes/sights');

var app = express();

// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 애플리케이션 라우트
app.use(spots);
app.use(sights);

// 404를 잡아 오류 처리기로 전달
app.use(function(req, res, next) {
  var err = new Error('Not Found');

  err.status = 404;
  next(err);
});

// 오류 처리기

// 스택 추적을 출력하는 개발자용 오류 처리기
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err
    });
  });
}

// 실제 서비스용 오류 처리기
// 사용자에게 스택 추적을 유출하지 않는다.
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
});


// 이미지 업로드2
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

var storage = multer.diskStorage({ //multers disk storage settings
	destination: function (req, file, cb) {
			cb(null, './uploads/')
	},
	filename: function (req, file, cb) {
			var datetimestamp = Date.now();
			cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
	}
});
	
var upload = multer({ //multer settings
								storage: storage
						}).single('file');

/** API path that will upload the files */
app.post('/upload', function(req, res) {
		upload(req,res,function(err){
				if(err){
						 res.json({error_code:1,err_desc:err});
						 return;
				}
				 res.json({error_code:0,err_desc:null});
		});
});

app.listen(3000);


module.exports = app;

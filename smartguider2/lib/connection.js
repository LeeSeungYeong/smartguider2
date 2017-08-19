var mongoose = require('mongoose');
//var dbUrl = 'mongodb://test:660616@ds035846.mlab.com:35846/heroku_9dsh4tgc';
var dbUrl = 'mongodb://smartguider2:1234@ds113580.mlab.com:13580/heroku_823djmtx';

//var dbUrl = 'mongodb://peace:660616@ds031157.mlab.com:31157/heroku_r7dt4gs1';

// mpromise is deprecated 에러 해결하기 위한 코드
mongoose.Promise = global.Promise;

mongoose.connect(dbUrl);

// 컨트롤 + C를 누르면 몽구스 연결 종료
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected');
    process.exit(0);
  });
});

require('../models/spot');
require('../models/sight');

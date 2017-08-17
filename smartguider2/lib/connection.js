var mongoose = require('mongoose');
var dbURI = 'mongodb://smartguider2:1234@ds113580.mlab.com:13580/heroku_823djmtx';

mongoose.connect(dbURI);

// 컨트롤 + C를 누르면 몽구스 연결 종료
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected');
    process.exit(0);
  });
});

require('../models/employee');
require('../models/team');
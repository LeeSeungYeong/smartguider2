var mongoose = require('mongoose');
var dbURI = 'mongodb://smartguider2:1234@ds113580.mlab.com:13580/heroku_823djmtx';

mongoose.connect(dbURI);

// ��Ʈ�� + C�� ������ ������ ���� ����
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected');
    process.exit(0);
  });
});

require('../models/employee');
require('../models/team');
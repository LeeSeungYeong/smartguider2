var express = require('express');
var mongoose = require('mongoose');
var Spot = mongoose.model('Spot');
var Sight = mongoose.model('Sight');
var formidable = require('formidable');
var fs = require('fs-extra');
var router = express.Router();

router.get('/spots', function(req, res, next) {
  Spot.find().sort('name').exec(function(error, results) {
    if (error) {
      return next(error);
    }

    // 유효한 데이터로 응답한다
    res.json(results);
  });
});

router.get('/spots/:spotId', function(req, res, next) {
  Spot.findOne({
    _id: req.params.spotId
  }).populate('sight').exec(function (error, results) {
    if (error) {
      return next(error);
    }

    // 유효한 사용자를 찾지 못하면 404를 전송한다
    if (!results) {
      res.sendStatus(404);
    }

    // 유효한 데이터로 응답한다
    res.json(results);
  });
});

router.put('/spots/:spotId', function (req, res, next) {
  // 다음 행을 제거하면 몽구스가 오류를 던진다
  // 몽고DB ID를 갱신하려 시도하기 때문이다
  delete req.body._id;
	
	/*
	var test = new Spot();
	test = req.body;
	
	var name = "";
	var filePath = "";
	var form = new formidable.IncomingForm();
	
	form.parse(req, function (err, fields, files) {
	});

	form.on('end', function (fields, files) {
		for (var i = 0; i < this.openedFiles.length; i++) {
			var temp_path = this.openedFiles[i].path;
			var file_name = this.openedFiles[i].name;
      var index = file_name.indexOf('/'); 
			var new_file_name = file_name.substring(index + 1);
			var new_location = 'public/images/';
			var db_new_location = 'images/';
			
			filePath = db_new_location + file_name;
      fs.copy(temp_path, new_location + file_name, function(err) { // 이미지 파일 저장하는 부분임
				if (err) {
						console.error(err);
				}
			});
		}
	});
	
	test.image = db_new_location;
	*/
	
  Spot.update({
    _id: req.params.spotId
  }, req.body, function (err, numberAffected, response) {
    if (err) {
      return next(err);
    }

    res.sendStatus(200);
  });
});


router.post('/spot/insert', function (req, res, next) {

	Spot.create(req.body, function (err, spot) {
		if (err) {
			return next(err);
		}
		
		res.json(spot);
	});
});

router.delete('/spot/delete/:spotId', function (req, res, next) {
	Spot.remove({
		_id: req.params.spotId
	}, function (err, output) {
		if (err) {
			return res.status(500).json({
				error: "database failure"
			});
		}
		
		res.status(204).end();
	});
});

router.post('/upload', function (req, res) {
	var form = new formidable.IncomingForm();
	
	form.parse(req, function (err, fields, files) {
		if (files.fileField1 === undefined) {
			res.status(500);
			res.json({'success': false, 'msg': 'no file sent'});
		}
		
		var oldPath = files.fileField1.path,
				newPath = __dirname + "/uploads/" + files.fileField1.name;
		
		fs.readFile(oldPath, function (err, data) {
			fs.writeFile(newPath, data, function (err, data) {
				fs.unlink(oldPath, function (err) {
					if (err) {
						res.status(500);
						res.json({'success': false});
					} else {
						res.status(200);
						res.json({'success': true});
					}
				});
			});
		});
	});
});

/*
router.post('/upload', function (req, res) {
	var name = "";
	var filePath = "";
	var form = new formidable.IncomingForm();
	
	form.parse(req, function (err, fields, files) {
	});

	form.on('end', function (fields, files) {
		for (var i = 0; i < this.openedFiles.length; i++) {
			var temp_path = this.openedFiles[i].path;
			var file_name = this.openedFiles[i].name;
      var index = file_name.indexOf('/'); 
			var new_file_name = file_name.substring(index + 1);
			var new_location = 'public/images/';
			var db_new_location = 'images/';
			
			filePath = db_new_location + file_name;
      fs.copy(temp_path, new_location + file_name, function(err) { // 이미지 파일 저장하는 부분임
				if (err) {
						console.error(err);
				}
			});
		}
	});
});
*/

module.exports = router;
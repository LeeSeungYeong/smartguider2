var express = require('express');
var mongoose = require('mongoose');
var Sight = mongoose.model('Sight');
var router = express.Router();

router.get('/sights', function (req, res, next) {
  Sight.find().sort('name').exec(function (error, results) {
    if (error) {
      return next(error);
    }

    //유효한 데이터로 응답한다
    res.json(results);
  });
});

router.get('/sights/:sightId', function (req, res, next) {
  Sight.findOne({
    _id: req.params.sightId
  }, function (error, results) {
    if (error) {
      return next(error);
    }

    res.json(results);
  });
});

router.put('/sights/:sightId', function (req, res, next) {
	delete req.body._id;
	
	Sight.update({
		_id: req.params.sightId
	}, req.body, function (err, numberAffected, response) {
		if (err) {
			return next(err);
		}
		
		res.sendStatus(200);
	});
});

router.post('/sight/insert', function (req, res, next) {
	Sight.create(req.body, function (err, sight) {
		if (err) {
			return next(err);
		}
		
		res.json(sight);
	});
});

router.delete('/sight/delete/:sightId', function (req, res, next) {
	Sight.remove({
		_id: req.params.sightId
	}, function (err, output) {
		if (err) {
			return res.status(500).json({
				error: "database failure"
			});
		}
		
		res.status(204).end();
	});
});

module.exports = router;

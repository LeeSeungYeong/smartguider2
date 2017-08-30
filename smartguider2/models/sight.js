var mongoose = require('mongoose');
var postFind = require('mongoose-post-find');
var async = require('async');
var Schema = mongoose.Schema;
var SightSchema = new Schema({
	name: {
	  type: String,
	  required: true
	},
	address: {
		type: String
	},
	zip: {
		type: Number
	},
	tel: {
		type: String
	},
	description: {
		type: String
	},
	coordinate: {
		latitude: {
			type: Number
		},
		longitude: {
			type: Number
		},
		zoom: {
			type: Number
		}
	},
	belongings: {
    type: [Schema.Types.Mixed]
	}
});

function _attachBelongings (Spot, result, callback) {
  Spot.find({
    sight: result._id
  }, function (error, spots) {
    if (error) {
      return callback(error);
    }
    result.belongings = spots;
    callback(null, result);
  });
}

// find와 findOne 관련 리스너
SightSchema.plugin(postFind, {
  find: function (result, callback) {
    var Spot = mongoose.model('Spot');

    async.each(result, function (item, callback) {
      _attachBelongings(Spot, item, callback);
    }, function (error) {
      if (error) {
        return callback(error);
      }

      callback(null, result)
    });
  },
  findOne: function (result, callback) {
    var Spot = mongoose.model('Spot');
    _attachBelongings(Spot, result, callback);
  }
});

module.exports = mongoose.model('Sight', SightSchema);

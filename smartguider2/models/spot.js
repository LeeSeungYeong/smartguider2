var mongoose = require('mongoose');
//var autoIncrement = require('mongodb-autoincrement');

var Schema = mongoose.Schema;
var SpotSchema = new Schema({
  name: {
    type: String,
    required: true
  },
	tel: {
		type: String
	},
	homepage: {
		type: String,
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
	description: {
		type: String
	},
  sight: {
    type: Schema.Types.ObjectId,
    ref: 'Sight'
  },
	inside: {
		floors: {
			type: [String],
			default: ''
		}
	},
  image: {
    type: String,
    default: 'images/building.png'
  }
});

//SpotSchema.plugin(autoIncrement.mongoosePlugin);

module.exports = mongoose.model('Spot', SpotSchema);

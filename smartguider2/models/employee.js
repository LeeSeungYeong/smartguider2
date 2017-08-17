var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var EmployeeSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		first: {
			type: String,
			required: true
		},
		last: {
			type: String,
			required: true
		}
	},
	team: {
		type: Schema.Types.ObjectId,       //유일한 식별자라는 뜻
		ref: 'Team'                        //이 값이 데이터베이스에서 채워질 때 사용할 모델이 무엇인지 몽구스에게 알려준다.
	},
	image: {
		type: String,
		default: 'images/user.png'
	},
	address: {
		lines: {
			type: [String]
		},
		city: {
			type: String
		},
		state: {
			type: String
		},
		zip: {
			type: Number
		}
	}
});

module.exports = mongoose.model('Employee', EmployeeSchema);
	
	
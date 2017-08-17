var async = require('async');
var mongoose = require('mongoose');
require(process.cwd() + '/lib/connection');
var Employee = mongoose.model('Employee');
var Team = mongoose.model('Team');

var data = {
	employees: [
	{
		id: '1000003',
		name: {
			first: 'Colin',
			last: 'Ihrig'
		},
		image: 'images/employees/1000003.png',
		address: {
			lines: ['11 Wall Street'],
			city: 'New York',
			state: 'NY',
			zipe: 10118
		}
	},
	{
		id: '1000021',
		name: {
			first: 'Adam',
			last: 'Bretz'
		},
		address: {
			lines: ['46 18th St', 'St.210'],
			city: 'Pittsburgh',
			state: 'PA',
			zipe: 15222
		}
	}
	],
	teams: [
	{
		name: 'Software and Services Group'
	},
	{
		name: 'Project Development'
	}
	]
};

var deleteEmployees = function (callback) {
	console.info('Deleting employees');
	Employee.remove({}, function(error, response) {
		if (error){
			console.error('Error deleting employees: ' + error);
		}

		console.info('Done deleting employees');
		callback();
	});
};

var addEmployees = function(callback) {
	console.info('Adding employees');
	Employee.create(data.employees, function (error) {
		if (error)	{
			console.error('Error: ' + error);
		}

		console.info('Done adding employees');
		callback();
	});
};

var deleteTeams = function(callback) {
	console.info('Deleting teams');
	Team.remove({}, function(error, response) {
		if(error){
			console.error('Error deleting teams: ' + error);
		}

		console.info('Done deleting teams');
		callback();
	});
};

var addTeams = function(callback) {
	console.info('Adding teams');
	Team.create(data.teams, function(error, team1){
		if(error){
			console.error('Error: ' + error);
		} else {
			data.team_id = team1.id;
		}

		console.info('Done adding teams');
		callback();
	});
};

var updateEmployeeTeams = function (callback) {
	console.info('Updating employee teams');
	var team = data.teams[0];

	Employee.update({}, {
		team: data.team_id
	},{
		multi: true
	}, function(error, numberAffected, response) {
			if (error){
			 console.error('Error updating employe team: ' + error);
			}

			console.info('Done updating employee teams');
			callback();
		});
};

async.series([
	deleteEmployees,
	addEmployees,
	deleteTeams,
	addTeams,
	updateEmployeeTeams
	], function(error, results) {
		if (error){
			console.error('Error: ' + error);
		}

	mongoose.connection.close();
	console.log('Done!');
});

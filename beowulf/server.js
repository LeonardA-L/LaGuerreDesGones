'use strict';
/**
 * Module dependencies.
 */
var init = require('../app/config/init')(),
	config = require('../app/config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk'),
	Schema = mongoose.Schema;

	mongoose.set('debug', true);
//var ActionSchema=require('../app/app/models/action.server.model').ActionSchema;
var db =undefined;

var ActionSchema = new Schema({

	type :{
		type: Number,
		default: 0
	},
	date:{
		type:Date
	},
	status :{
		type: Number,
		default: 0
	},
	gameId :{
		type: String
	}
});
/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */


var execute = function(){
	//console.log(Action.collection.conn.collections);
	var Action = db.model('Action');

	//Cleanse
	Action.remove({}, function(err,data){
		console.log('Remove return '+err);
	});

	console.log('Starting process');
	// Dummy action
	var a = new Action({
		'type' : 0,
		'date':new Date(),
		'status' :0
	});
	a.save(function(err,data){
		console.log('back');
		if (err)
            console.log('Error saving variable');
        console.log(data);
	});
	//
	setTimeout(function(){
		console.log('looking for action');
		Action.find({type:0}, function (err, docs) {
			if (err){
				console.log(err);
			}
	        console.log(docs);
	    });
	},2000);

};

// Bootstrap db connection
console.log('Connecting to mongo '+config.db);
db = mongoose.connect(config.db, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
	else{
		db.model('Action', ActionSchema);

		execute();
	}
});


// Logging initialization
console.log('Action processor started');
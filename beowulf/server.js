'use strict';
/**
 * Module dependencies.
 */
var init = require('../app/config/init')(),
	config = require('../app/config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk'),
	Schema = mongoose.Schema;

	//mongoose.set('debug', true);
//var ActionSchema=require('../app/app/models/action.server.model').ActionSchema;
var i=1;
var db =undefined;
var Action = undefined;
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



 var processAction = function(a){
 	a.status = 2;
 };

var checkAndProcess = function(){
	setTimeout(function(){
		//console.log('looking for action');
		Action.find({'status':0}, function (err, docs) {
			if (err){
				console.log(err);
			}
			var actionList = [];
			// Lock
	        for(var j =0;j<docs.length;j++){
	        	console.log('Found one !');
	        	docs[j].status = 1;
	        	docs[j].save();
	        	actionList.push(docs[j]);
	        }
	        // Unlock
	        if(actionList.length > 0){
		        for(var j=0;j<actionList.length;j++){
		        	processAction(actionList[j]);
		        }
		        // Lock
		        for(var j=0;j<actionList.length;j++){
		        	actionList[j].save();
		        }
		        // Unlock
	        }
	        checkAndProcess();
	    });
	},10);
};

var execute = function(){

	//Cleanse
	Action.remove({}, function(err,data){
		console.log('Remove return '+err);
	});

	console.log('Starting process');
	//
	checkAndProcess();

};

// Debug
var displayDB = function(){
	setTimeout(function(){
		Action.find({}, function (err, docs) {
			if (err){
				console.log(err);
			}
	        console.log(docs);
	    });
		displayDB();
	},5000);
};

// Dummy inject actions
var dummyInject = function(){
	setTimeout(function(){
		var a = new Action({
		'type' : i,
		'date':new Date(),
		'status' :0
		});
		a.save(function(err,data){
			if (err)
	            console.log('Error saving variable');
	        //console.log(data);
		});
		i++;
		dummyInject();
	},6000);
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
		Action = db.model('Action');
		execute();
		displayDB();
		dummyInject();
	}
});


// Logging initialization
console.log('Action processor started');


'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
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

		Action.collection.findAndModify({'status':0},[['_id','asc']],{$set: {status: 1}},{}, function (err, doc) {
			if (err){
				console.log(err);
			}
			var actionList = [];
			if(doc !== null){
				
				Action.findOne({'_id':doc._id}, function (err, action) {
					if (err){
						console.log(err);
					}
					console.log('Found one');
			        //console.log(action);
			        processAction(action);
			        action.save();
			    });

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
	},3000);
};

// Bootstrap db connection
var dbAddress = 'mongodb://'+(process.argv[2]||'localhost')+':'+(process.argv[3]||27017)+'/'+config.dbname;
console.log('Connecting to mongo '+dbAddress);
db = mongoose.connect(dbAddress, function(err) {
	console.log('Connection returned');
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


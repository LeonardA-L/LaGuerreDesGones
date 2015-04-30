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

// Action model
var Action = undefined;

// dirty pasted model
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

// TODO
 var processAction = function(a){
 	var duration = 1000;
 	for (var i=0 ; i < a.units.length ; ++i) {
 		var u = a.unit[i];
 		u.available=false;
 		u.ts=a.date.getTime();
 		u.te=u.ts+duration;
 		u.xt=a.zoneB.x;
 		u.yt=a.zoneB.y;
 		u.x=a.zoneA.x;
 		u.y=a.zoneA.y;
 	}
 	a.status = 2;
 };

// Main work
var execute = function(){

	setTimeout(function(){

		// Find an Action needing processing, tag it as assigned
		Action.collection.findAndModify({'status':0},[['_id','asc']],{$set: {status: 1}},{}, function (err, doc) {
			if (err){
				console.log(err);
				return;
			}

			if(doc !== null){
				// Find and modify doesn't output an Action object, so there's another request
				// There's probably a better way
				Action.findOne({'_id':doc._id}, function (err, action) {
					if (err){
						console.log(err);
					}
					
					//console.log(action);

			        processAction(action);

			        action.save();
			    });
	    	}

	    	// Re launch
	        execute();
	    });
	},config.pollingInterval);
};

// For debug purpose, display the Action collection
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
// For debug purpose, injects dummy Action objects into collection
var i=1;
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
var dbAddress = 'mongodb://'+(process.argv[2]||config.defaultHost)+':'+(process.argv[3]||config.defaultPort)+'/'+config.dbname;

console.log('Connecting to mongo '+dbAddress);

var db = mongoose.connect(dbAddress, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
	else{
		console.log(chalk.green('MongoDB connection successful'));
		db.model('Action', ActionSchema);
		Action = db.model('Action');

		// Start processing routine
		execute();

		// For debug purpose
		displayDB();
		dummyInject();
	}
});


// Logging initialization
console.log('Action processor started');


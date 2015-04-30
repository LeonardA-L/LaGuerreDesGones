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
var Zone = undefined;
var Unit = undefined;
var Game = undefined;
// dirty pasted model



var GameSchema = new Schema({
	title: {
		type: String,
		trim: true,
		default: '',
	},
	nMaxPlayerUnit: {
		type: Number,
		required: true
	},
	nMaxPlayer: {
		type: Number,
		required: true
	},
	isInit: {
		type: Boolean,
		default: false,
	},
	startTime: {
		type: Date
	},
	zones: [{
		type: Schema.Types.ObjectId,
		ref: 'Zone'
	}]
});

var UnitSchema = new Schema({
	type: {
		type: Number,
		default: 0
	},
	zone: {
		type: Schema.Types.ObjectId,
		ref: 'ZoneSchema'
	},
	attack: {
		type: Number,
		default: 0
	},
	defence: {
		type: Number,
		default: 0
	},
	health: {
		type: Number,
		default: 0
	},
	point: {
		type: Number,
		default: 0
	},
	x: {
		type: Number,
		default: 0
	},
	y: {
		type: Number,
		default: 0
	},
	xt: {
		type: Number,
		default: 0
	},
	yt: {
		type: Number,
		default: 0
	},
	te: {
		type: Number,
		default: 0
	},
	ts: {
		type: Number,
		default: 0
	},
	available: {
		type: Boolean,
		default: true
	}
});


var ZoneSchema = new Schema({
	type: {
		type: Number,
		default: 0
	},
	name: {
		type: String,
		default: ''
	},
	nbUnitMax: {
		type: Number,
		default: 0
	},
	point: {
		type: Number,
		default: 0
	},
	x: {
		type: Number,
		default: 0
	},
	y: {
		type: Number,
		default: 0
	},
	units: [{
		type: Schema.Types.ObjectId,
		ref: 'UnitSchema'
	}],
	game:{
		type: Schema.Types.ObjectId,
		ref: 'Game'
	}
});

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
	},
	
	// For Displacement
	zoneA:{
		type: Schema.Types.ObjectId,
		ref: 'Zone'
	},
	zoneB:{
		type: Schema.Types.ObjectId,
		ref: 'Zone'
	},
	units:[{
		type: Schema.Types.ObjectId,
		ref: 'Unit'
	}],
	// For battle
	zone:{
		type: Schema.Types.ObjectId,
		ref: 'Zone'
	},
	
	// For init
	
	game:{
		type: Schema.Types.ObjectId,
		ref: 'Game'
	}
	
});

var affectUnitToZone = function(u,z){
	u.zone = z._id;
	u.x = z.x;
	u.y = z.y;
	u.xt = z.x;
	u.yt = z.y;

	console.log(z);
	z.units.push(u._id);
};

var processDisplacement = function(a){
	var duration = 1000;
 	console.log('Processing action');
 	for (var i=0 ; i < a.units.length ; ++i) {
 		var u = a.units[i];
 		u.available=false;
 		u.ts=a.date.getTime();
 		u.te=u.ts+duration;
 		u.xt=a.zoneB.x;
 		u.yt=a.zoneB.y;
 		u.x=a.zoneA.x;
 		u.y=a.zoneA.y;
		
		// TODO
		u.save();
 	}
};

var processEndDisplacement = function(a){

};


// Dummy process init
var processInit = function(a){
	// DUMMY
	var zdA = new Zone({
		name:'Charpennes',
		point:42,
		x:10,
		y:15,
		game:a.game._id,
		units:[]
	});
	var zdB = new Zone({
		name:'Charles Hernu',
		point:42,
		x:20,
		y:25,
		game:a.game._id,
		units:[]
	});
	var ud = new Unit();
	affectUnitToZone(ud,zdA);
	zdA.save();
	zdB.save();
	ud.save();
	a.game.zones = [zdA,zdB];
	a.game.startTime = a.date;
	a.game.isInit = true;
	a.game.save();
};

var actionHandlers = [];
actionHandlers.push(processDisplacement);
actionHandlers.push(processEndDisplacement);
actionHandlers.push(processInit);

// TODO
 var processAction = function(a){
 	actionHandlers[a.type](a);
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
				var actionCallback = function (err, action) {
						if (err){
							console.log(err);
						}
					
						//console.log(action);

					processAction(action);

					action.save();
				    };

				switch(doc.type){
					case 0:
						Action.findOne({'_id':doc._id}).populate('units').populate('zoneA').populate('zoneB').exec(actionCallback);
					break;
					case 2:
						Action.findOne({'_id':doc._id}).populate('game').exec(actionCallback);
					break;
				}
	    		}

	    	// Re launch
	        execute();
	    });
	},config.pollingInterval);
};

// For debug purpose, display the Action collection
var displayDB = function(){
	setTimeout(function(){
		Action.find({}).populate('units').populate('zoneA').populate('zoneB').exec(function (err, docs) {
			if (err){
				console.log(err);
			}
	        console.log(docs);
	    });
		displayDB();
	},10000);
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
		db.model('Unit', UnitSchema);
		db.model('Zone', ZoneSchema);
		db.model('Action', ActionSchema);
		db.model('Game', GameSchema);
		
		Action = db.model('Action');
		Zone = db.model('Zone');
		Unit = db.model('Unit');
		Game = db.model('Game');

		// Start processing routine
		execute();

		// For debug purpose
		displayDB();
		//dummyInject();
	}
});


// Logging initialization
console.log('Action processor started');


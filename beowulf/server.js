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
var ZoneDescription = undefined;

// dirty pasted model

var ZoneDescriptionSchema = new Schema({
	type: {
		type: String,
		enum: [NEUTRAL, HOSPITAL, PARK, UNIVERSITY, CHURCH, WOODSTOCK, STATION, AIRPORT, CITY_HALL, SQUARE, BANK, SHOPPING_CENTRE],
		default: NEUTRAL
	},
	name: {
		type: String,
		trim: true,
		default: ''
	},
	nbUnitMax: {
		type: Number,
		default: DEFAULT_MAX_UNIT_NUMBER
	},
	border: Schema.Types.Mixed,
	x : Number,
	y : Number
});

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
	nMinPlayer: {
		type: Number
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
	}],
	players: [{
		type: Schema.Types.ObjectId,
		ref: 'Player'
	}]
});

var UnitSchema = new Schema({
	type: {
		type: Number,
		default: 0
	},
	zone: {
		type: Schema.Types.ObjectId,
		ref: 'Zone'
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
	},
	game:{
		type: Schema.Types.ObjectId,
		ref: 'Game'
	},
	player: {
		type: Schema.Types.ObjectId,
		ref: 'Player'
	}
});


var ZoneSchema = new Schema({
	units: [{
		type: Schema.Types.ObjectId,
		ref: 'Unit'
	}],
	game:{
		type: Schema.Types.ObjectId,
		ref: 'Game'
	},
	zoneDesc:{
		type: Schema.Types.ObjectId,
		ref: 'ZoneDescription',
// TODO		required: true
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
	u.game = z.game;
	z.units.push(u._id);
};

var processDisplacement = function(a){
	var duration = 30000;
 	console.log('Processing displacement action');
 	//console.log(a);
 	for (var i=0 ; i < a.units.length ; ++i) {
 		var u = a.units[i];
 		u.available=false;
 		u.ts=a.date.getTime();
 		u.te=u.ts+duration;
 		u.xt=a.zoneB.x;
 		u.yt=a.zoneB.y;
 		u.x=a.zoneA.x;
 		u.y=a.zoneA.y;
 		console.log(a.zoneA.units);
		a.zoneA.units.splice(a.zoneA.units.indexOf(u._id), 1);
		console.log(a.zoneA.units);
		// TODO
		u.save();
 	}

 	var b = new Action({
		type :1,
		date: new Date(a.date.getTime() + duration),
		status :0,
		units:a.units,
		zone:a.zoneB,
	});
	//console.log(b.date);
	console.log('Saving end displacement action');
	b.save();
};

var processEndDisplacement = function(a){
	console.log('Processing end displacement action');
	//console.log(a);
	for (var i=0 ; i < a.units.length ; ++i) {
 		var u = a.units[i];
 		u.available=true;
 		u.ts=a.date.getTime();
 		u.te=u.ts;
 		affectUnitToZone(u,a.zone);
		a.zone.save();
		// TODO
		u.save();
 	}
};


// Dummy process init
var processInit = function(a){
	var zoneIdList = [];
	var neutralZones = [];

	var initPlayers = 8;

	ZoneDescription.find({},function(err,zdList){

		for(var i=0;i<zdList.length;i++){
			var zd = zdList[i];
			var z = new Zone({
				zoneDesc : zd._id;
				game : a.game._id;
			});
			zoneIdList.push(z._id);
			if(zd.type === 'neutral'){
				neutralZones.push(z);
			}
			z.save();
		}

		for(var i=0;i<a.game.players.length;i++){
			var nz = neutralZones[Math.floor(Math.random() * neutralZones.length)];
			for(var j=0;j<initPlayers;j++){
				var u = new Unit({
					game:a.game._id,
					player:a.game.players[i]._id,
					zone:nz._id
				});
				a.game.players[i].units.push(u._id);
				u.save();
			}
			a.game.players[i].save();
		}

		a.game.zones = zoneIdList;
		a.game.startTime = a.date;
		a.game.isInit = true;
		a.game.save();
	});
/*
	console.log('Processing init action');
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
	a.game.zones = [zdA._id,zdB._id];
	a.game.startTime = a.date;
	a.game.isInit = true;
	a.game.save();
*/
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
		Action.collection.findAndModify({'status':0, 'date':{$lte:new Date()}},[['_id','asc']],{$set: {status: 1}},{}, function (err, doc) {
		//Action.collection.findAndModify({'status':0},[['_id','asc']],{$set: {status: 1}},{}, function (err, doc) {
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
					case 0: // Displacement
						Action.findOne({'_id':doc._id}).populate('units zoneA zoneB').populate('zoneA.zoneDesc zoneB.zoneDesc').exec(actionCallback);
					break;
					case 1: // End Displacement
						Action.findOne({'_id':doc._id}).populate('zone units').populate('zone.zoneDesc').exec(actionCallback);
					break;
					case 2: // Init
						Action.findOne({'_id':doc._id}).populate('game players').exec(actionCallback);
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
		Action.find({'status':0}).exec(function (err, docs) {
			if (err){
				console.log(err);
			}
	        //console.log(docs);
	        console.log(docs.length + ' unprocessed actions');
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
		db.model('Unit', UnitSchema);
		db.model('Zone', ZoneSchema);
		db.model('Action', ActionSchema);
		db.model('Game', GameSchema);
		
		Action = db.model('Action');
		Zone = db.model('Zone');
		Unit = db.model('Unit');
		Game = db.model('Game');


		//Action.collection.remove({},function(){});

		// Start processing routine
		execute();

		// For debug purpose
		displayDB();
		//dummyInject();
	}
});


// Logging initialization
console.log('Action processor started');


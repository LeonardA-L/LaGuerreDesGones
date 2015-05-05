'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk'),
	Schema = mongoose.Schema;
var express = require('express');

//mongoose.set('debug', true);
//var ActionSchema=require('../app/app/models/action.server.model').ActionSchema;
var debug=config.debug;
var state=true;

// Action model
var Action = undefined;
var Zone = undefined;
var Unit = undefined;
var Game = undefined;
var ZoneDescription = undefined;
var Player = undefined;
var Matrix = undefined;

var matrixes = undefined;

var initPlayers = 8;
var initMoney = 1000;
var sellRatio = 0.4;

var NEUTRAL = 'neutral';
var HOSPITAL = 'hospital';
var PARK = 'park';
var UNIVERSITY = 'university';
var CHURCH = 'church';
var WOODSTOCK = 'woodstock';
var STATION = 'station';
var AIRPORT = 'airport';
var CITY_HALL = 'city_hall';
var SQUARE = 'square';
var BANK = 'bank';
var SHOPPING_CENTRE = 'shopping_centre';

var DEFAULT_MAX_UNIT_NUMBER = 8;

var updateInterval = 120000;
var updateMoney = 0;

var pointBuyFactor = 0.5;
var pointSellFactor = 0.5;
var baseDispPoints = 2;
var baseWarPoints = 4;
var winPoints = 11

var odds = 25;

// dirty pasted model

var MatrixSchema = new Schema({
	name : String,
	content: Schema.Types.Mixed
});

var PlayerSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: true
	},
	dateCreated: {
		type: Date,
		default: Date.now
	},
	isAdmin:{
		type: Boolean,
		default: false
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	game: {
		type: Schema.Types.ObjectId,
		ref: 'Game'
	},
	money: {
		type: Number,
		default: 0
	},
	point: {
		type: Number,
		default: 0
	},
	units: [{
		type: Schema.Types.ObjectId,
		ref: 'Unit'
	}]
});

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

	border: Schema.Types.Mixed,

	x : Number,

	y : Number,
	
	velov : Number

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
	},
	nbUnitMax: {
		type: Number,
		default: DEFAULT_MAX_UNIT_NUMBER
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'Player'
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
	},
	player: {
		type: Schema.Types.ObjectId,
		ref: 'Player'
	},
	newUnitType : Number
	
});

var syncEndProcess = function(action){
	action.save();

	var http = require('http');
	var options = {
	  host: (process.argv[2]||config.defaultHost),
	  path: '/'+config.callback,
	  port: (process.argv[5]||config.defaultCallbackPort),
	  method: 'POST',
	  json: true,
	  headers: {
	      "content-type": "application/json",
	    }
	    ///body: JSON.stringify({game:action.game})
	};
	
	var req = http.request(options);
	req.on('error', function(error) {
  		if(debug) console.log('Server unreachable');
	});
	req.write(JSON.stringify({game:action.game._id || action.game}));
	req.end();
};

var affectUnitToZone = function(u,z,zd){
	u.zone = z._id;
	u.x = zd.x;
	u.y = zd.y;
	u.xt = zd.x;
	u.yt = zd.y;
	u.game = z.game;
	z.units.push(u._id);
	z.owner = u.player;
};

var processDisplacement = function(a){

	var syncFunction=function(){
		var duration = 10000;
		for (var i=0 ; i < a.units.length ; ++i) {
	 		var u = a.units[i];
	 		u.available=false;
	 		u.ts=a.date.getTime();
	 		u.te=u.ts+duration;
	 		u.xt=a.zoneB.zoneDesc.x;
	 		u.yt=a.zoneB.zoneDesc.y;
	 		u.x=a.zoneA.zoneDesc.x;
	 		u.y=a.zoneA.zoneDesc.y;
			a.zoneA.units.splice(a.zoneA.units.indexOf(u._id), 1);
			// TODO
			u.save();
			a.zoneA.save();
	 	}

	 	var b = new Action({
			type :1,
			date: new Date(a.date.getTime() + duration),
			status :0,
			units:a.units,
			zone:a.zoneB._id,
			game:a.game
		});
		//console.log(b.date);
		if(debug) console.log('Saving end displacement action');
		b.save(function(err){
			if(debug && err) console.log(err);
			syncEndProcess(a);
		});
	};
	
	var syncCount = 2;
 	if(debug) console.log('Processing displacement action');
 	Zone.findById(a.game.zoneA).populate('zoneDesc').exec(function(err,zo){
 		a.game.zoneA = zo;
 		if(--syncCount === 0){
 			syncFunction();
 		}
 	});
 	Zone.findById(a.game.zoneB).populate('zoneDesc').exec(function(err,zo){
 		a.game.zoneB = zo;
 		if(--syncCount === 0){
 			syncFunction();
 		}
 	});
 	//console.log(a);
 	
};

var processEndDisplacement = function(a){
	if(debug) console.log('Processing end displacement action');
	//console.log(a);
	Zone.findById(a.zone._id).populate('zoneDesc units').exec(function(err,zo){
		a.game.zone = zo;
		a.zone = zo;
		var i=0;

		var firstID = undefined
		var firstUnits = [];
		if(a.zone.units.length > 0){
			firstID = a.zone.units[0].player;
		}
		console.log(firstID);
		for(i=0;i<a.zone.units.length;i++){
			var u = a.zone.units[i];
			firstUnits.push(u);
		}
		console.log('New on stage');
		var secondID = a.units[0].player;
		console.log(secondID);
		var secondUnits = [];
 		for (i=0 ; i < a.units.length ; ++i) {
	 		var u = a.units[i];
	 		u.available=true;
	 		u.ts=a.date.getTime();
	 		u.te=u.ts;
	 		affectUnitToZone(u,a.zone, a.zone.zoneDesc);
			secondUnits.push(u);
			u.save();
 		}
		
		// TODO Battle
		if(''+firstID !== ''+secondID && firstID !== undefined){
			Player.find({'_id':{$in:[firstID,secondID]}},function(err,players){
				
				var fp = players[0];
				var sp = players[1];
				if(players[0]._id === secondID){
					fp = players[1];
					sp = players[0];
				}

				fp.point+=baseWarPoints;
				sp.point+=baseWarPoints;

				console.log('Battle between '+fp.name+' and '+sp.name);
				a.zone.owner = fp._id;
				var i=0;
				var j=0;
				var baseHP = 10;

				// Start by giving everyone HPs
				for(i=0;i<firstUnits.length;i++){
					firstUnits[i].hp = baseHP * secondUnits.length;
				}
				for(i=0;i<secondUnits.length;i++){
					secondUnits[i].hp = baseHP * firstUnits.length;
				}

				// While there is still two team
				while(firstUnits.length > 0 && secondUnits.length > 0){
					//console.log('Entering Loop');

					// for each pair, make them battle
					for(i=0;i<firstUnits.length;i++){
						for(j=0;j<secondUnits.length;j++){
							var f = firstUnits[i];
							var s = secondUnits[j];
							
							// f to s
							var r1 = (((Math.random()*2*odds)-odds)/100)+1;
							var r2 =(((Math.random()*2*odds)-odds)/100)+1;
							var d = baseHP * (r1*f.attack/10) * (r2*(1-s.defence)/10);
							s.hp -= d;

							// s to f
							r1 = (((Math.random()*2*odds)-odds)/100)+1;
							r2 = (((Math.random()*2*odds)-odds)/100)+1;
							d = baseHP * (r1*s.attack/10) * (r2*(1-f.defence)/10);
							f.hp -= d;
						}
					}

					// Take out the ones who are dead
					for(i=0;i<firstUnits.length;i++){
						if(firstUnits[i].hp <= 0){
							var u = firstUnits[i];
							//console.log(u._id + ' OUT !');
							
							for(j = 0; j<a.zone.units.length;j++){
								if(a.zone.units[j]._id === u._id){
									a.zone.units.splice(j, 1);
									break;
								}
							}
							u.remove(function(){});
							firstUnits.splice(i, 1);
							i--;
						}
					}

					for(i=0;i<secondUnits.length;i++){
						if(secondUnits[i].hp <= 0){
							var u = secondUnits[i];
							//console.log(u._id + ' OUT !');
							
							for(j = 0; j<a.zone.units.length;j++){
								if(a.zone.units[j]._id === u._id){
									a.zone.units.splice(j, 1);
									break;
								}
							}
							u.remove(function(){});
							secondUnits.splice(i, 1);
							i--;
						}
					}
				}
				
				if(secondUnits.length > 0){
					sp.point+=winPoints;
					a.zone.owner = sp._id;
				}
				if(firstUnits.length > 0){
					fp.point+=winPoints;
					a.zone.owner = fp._id;
				}

				sp.save();
				fp.save();
				a.zone.save();
				syncEndProcess(a);
			});
		}
		else{
			Player.findById(secondID,function(err,player){
				console.log('No Battle');
				player.point+=baseDispPoints;
				player.save();
				a.zone.save();
				syncEndProcess(a);
			});
		}
		
		
 	});
	
};


// Dummy process init
var processInit = function(a){
	if(debug) console.log('Processing init action');
	var zoneIdList = [];
	var neutralZones = [];
	var neutralZonesDesc = [];

	ZoneDescription.find({},function(err,zdList){

		for(var i=0;i<zdList.length;i++){
			var zd = zdList[i];
			var z = new Zone({
				game : a.game._id,
				zoneDesc : zd
			});
			
			zoneIdList.push(z._id);
			if(zd.type === NEUTRAL){
				neutralZones.push(z);
				neutralZonesDesc.push(zd);
			}
			z.save();
		}

		Player.find({'_id':{$in:a.game.players}}, function(err,players){
			for(var i=0;i<players.length;i++){
				var idx = Math.floor(Math.random() * neutralZones.length);
				var nz = neutralZones[idx];
				var nzd = neutralZonesDesc[idx];
				for(var j=0;j<initPlayers;j++){
					var u = new Unit(matrixes.UnitData.content[0]);

					u.game=a.game._id,
					u.player=players[i]._id,
					u.zone=nz._id

					affectUnitToZone(u,nz,nzd);
					if(players[i].units === undefined){
						players[i].units = [u._id];
					}
					else{
						players[i].units.push(u._id);
					}
					u.save();
					nz.save();
				}
				//console.log(players[i]);
				players[i].money = initMoney;
				players[i].save();
			}	
		});


		a.game.zones = zoneIdList;
		a.game.startTime = a.date;
		a.game.isInit = true;
		a.game.save();

		// generate next hop
		if(debug) console.log('Generate next hop');
		var b = new Action({
			type:5,
			game:a.game._id,
			date:new Date(a.date.getTime()+updateInterval)
		});
		b.save(function(err){
			syncEndProcess(a);
		});
	});
};

var processBuy = function(a){
	if(debug) console.log('Processing buy action');
	var price = matrixes.UnitData.content[a.newUnitType].price;
	a.player.money -= price;
	a.player.point += price*pointBuyFactor;
	// TODO create unit according to real stuff
	var u = new Unit(matrixes.UnitData.content[a.newUnitType]);
	ZoneDescription.findById(a.zone.zoneDesc,function(err, zd){
		u.player = a.player._id;
		affectUnitToZone(u,a.zone,zd);
		a.player.units.push(u._id);
		u.save();
		a.zone.save();
		a.player.save();

		syncEndProcess(a);
	});
};

var processSell = function(a){
	if(debug) console.log('Processing sell action');
	
	Unit.findById(a.units[0], function(err, data){
		if(err)
			if(debug) console.log(err);
		if(data !== null){
			//console.log(data);
			Unit.remove({'_id':a.units[0]}, function(err){
				if(err)
					if(debug) console.log(err);
			});
			var price = sellRatio*matrixes.UnitData.content[data.type].price;
			a.player.money += price;
			a.zone.units.splice(a.zone.units.indexOf(a.units[0]),1);
			a.player.units.splice(a.player.units.indexOf(a.units[0]),1);
			a.player.point += price*pointSellFactor;
			a.player.save();
			a.zone.save();
		}
		else{
			if(debug) console.log('Null data');
		}
		syncEndProcess(a);
	});
};

var processHop = function(a){
	if(debug) console.log('Processing Hop action');
	Player.find({'_id':{$in:a.game.players}}, function(err,players){
		for(var j=0;j<players.length;j++){
			players[players[j]._id] = players[j];
		}

		Zone.find({'_id':{$in:a.game.zones}}).populate('zoneDesc units').exec(function(err,zones){
			for(var i=0;i<zones.length;i++){
				if(zones[i].units.length > 0){
					// Generate Unit
					var u = new Unit(matrixes.UnitData.content[matrixes.ZoneTypeToUnitType.content[zones[i].zoneDesc.type]]);
					// affect to player
					var p = players[zones[i].units[0].player];
					u.player = p._id;
					affectUnitToZone(u,zones[i],zones[i].zoneDesc);
					
					p.units.push(u._id);

					zones[i].save();
					u.save();
					p.save();
				}
			}

			syncEndProcess(a);
		});
	});

	if(debug) console.log('Generate next hop');
		var b = new Action({
			type:5,
			game:a.game,
			date:new Date(a.date.getTime()+updateInterval)
		});
		b.save();
};

var actionHandlers = [];
actionHandlers.push(processDisplacement);
actionHandlers.push(processEndDisplacement);
actionHandlers.push(processInit);
actionHandlers.push(processBuy);
actionHandlers.push(processSell);
actionHandlers.push(processHop);

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
				if(debug) console.log(err);
				return;
			}

			if(doc !== null){
				// Find and modify doesn't output an Action object, so there's another request
				// There's probably a better way
				var actionCallback = function (err, action) {
						if (err){
							if(debug) console.log(err);
						}
					
						//console.log(action);

					processAction(action);
				};

				switch(doc.type){
					case 0: // Displacement
						Action.findOne({'_id':doc._id}).populate('units zoneA zoneB').exec(actionCallback);
					break;
					case 1: // End Displacement
						Action.findOne({'_id':doc._id}).populate('zone units').exec(actionCallback);
					break;
					case 2: // Init
						Action.findOne({'_id':doc._id}).populate('game').exec(actionCallback);
					break;
					case 3: // Buy
					case 4: // Sell
						Action.findOne({'_id':doc._id}).populate('player zone').exec(actionCallback);
					break;
					case 5: // Hop
						Action.findOne({'_id':doc._id}).populate('game').exec(actionCallback);
					break;
				}
	    	}

	    	Action.count({'status':0, 'date':{$lte:new Date()}},function(err,count){
				if(debug) console.log(count);
	    		if(count > 0){
	    			// Re launch
	        		execute();
	    		}
	    		else{
	    			// Stopping since not needed
	    			console.log('Stopping');
	    			state = false;
	    		}
	    	});
	    	
	    });
	},config.pollingInterval);
};

// For debug purpose, display the Action collection
var displayDB = function(){
	setTimeout(function(){
		Action.find({'status':0}).exec(function (err, docs) {
			if (err){
				if(debug) console.log(err);
			}
	        //console.log(docs);
	        console.log(docs.length + ' unprocessed actions');
	    });
		displayDB();
	},5000);
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
		db.model('Player', PlayerSchema);
		db.model('ZoneDescription', ZoneDescriptionSchema);
		db.model('Matrix', MatrixSchema);
		
		Action = db.model('Action');
		Zone = db.model('Zone');
		Unit = db.model('Unit');
		Game = db.model('Game');
		Player = db.model('Player');
		Matrix = db.model('Matrix');
		ZoneDescription = db.model('ZoneDescription');


		Matrix.find({'name':{$in:['UnitData','ZoneTypeToUnitType']}},function(err,mat){
			matrixes = {};
			for(var i=0;i<mat.length;i++){
				matrixes[mat[i].name] = mat[i];
			}
		});
		//var zdDummy = new ZoneDescription({type:'neutral'});
		//zdDummy.save();

		//Action.collection.remove({},function(){});

		// Start processing routine
		//execute();
		autoWakeUp();

		// For debug purpose
		if(debug) displayDB();
	}
});


var app = express();

app.get('/', function(req, res){
	if(!state){
		res.send('Going to work');
		console.log('Forced wake up');
		state=true;
		execute();
	}
});

app.listen(process.argv[4]||7878);

// Logging initialization
console.log('Action processor started');

var autoWakeUp = function(){
	console.log('Auto wakeup');
	state=true;
	execute();
	setTimeout(function(){
		autoWakeUp();
	},config.autoWakeupInterval);
};

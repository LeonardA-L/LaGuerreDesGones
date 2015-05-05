'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk'),
	express = require('express'),
	XmlHttpRequest = require('xmlhttprequest').XMLHttpRequest,
	http = require('http'),
	path = require('path');


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

var DEFAULT_MAX_UNIT_NUMBER = 8;


var updateInterval = 30000;
var updateVelovInterval = 300000;
var updateTCLInterval = 3600000;

var updateMoney = 0;

var pointBuyFactor = 0.5;
var pointSellFactor = 0.5;
var baseDispPoints = 2;
var baseWarPoints = 4;
var winPoints = 11;

var victoryPoint = 300;

var hopMoney = 100;
var winMoney = 100;
var loseMoney = 100;
var dispMoney = 10;

var odds = 25;
var baseHP = 40;

var maxUnitPerZone = 8;

var notifyServer = function(gameId){
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
	req.write(JSON.stringify({game:gameId}));
	req.end();
};

var syncEndProcess = function(action, failed){
	action.status = 2;
	if(failed){
		action.status = 3;
		console.log('Action failed');
	}
	action.save();
	console.log('End action '+action._id);
	if(action.game){
		if(action.type === 8){
			if(action.game.winner){
				notifyServer(action.game._id || action.game);
			}
		}
		else{
			var endCheck = new Action({
				status:0,
				type:8,
				date:new Date(),
				game:action.game._id || action.game
			});
			endCheck.save();
			notifyServer(action.game._id || action.game);
		}
	}
	else{
		// Push to all
	}
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

				// Start by giving everyone HPs
				for(i=0;i<firstUnits.length;i++){
					firstUnits[i].hp = baseHP * secondUnits.length;
				}
				for(i=0;i<secondUnits.length;i++){
					secondUnits[i].hp = baseHP * firstUnits.length;
				}

				// While there is still two team
				while(firstUnits.length > 0 && secondUnits.length > 0){
					//console.log('Entering Loop '+firstUnits.length+'-'+secondUnits.length);

					// for each pair, make them battle
					for(i=0;i<firstUnits.length;i++){
						for(j=0;j<secondUnits.length;j++){
							var f = firstUnits[i];
							var s = secondUnits[j];
							
							//console.log('Fight '+i+'-'+j);
							// f to s
							var r1 = (((Math.random()*2*odds)-odds)/100)+1;
							var r2 =(((Math.random()*2*odds)-odds)/100)+1;
							var d = baseHP * (r1*f.attack) * (r2*(baseHP-s.defence));
							//console.log(r1+'-'+f.attack+'-'+r2+'-'+s.defence+'-'+d);
							s.hp -= d;

							// s to f
							r1 = (((Math.random()*2*odds)-odds)/100)+1;
							r2 = (((Math.random()*2*odds)-odds)/100)+1;
							d = baseHP * (r1*s.attack) * (r2*(baseHP-f.defence));
							f.hp -= d;
							//console.log(r1+'-'+s.attack+'-'+r2+'-'+f.defence+'-'+d);
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
					sp.money += winMoney;
					fp.money += loseMoney;
					a.zone.owner = sp._id;
				}
				else {
					fp.point+=winPoints;
					a.zone.owner = fp._id;
					fp.money += winMoney;
					sp.money += loseMoney;
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
				player.money += dispMoney;
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
	if(debug) console.log('Units on zone '+a.zone.units.length);
	if(a.zone.units.length < maxUnitPerZone){
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
	}
	else{
		syncEndProcess(a, true);
	}
	
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
				if(zones[i].owner && zones[i].units.length < maxUnitPerZone){
					// Generate Unit
					var u = new Unit(matrixes.UnitData.content[matrixes.ZoneTypeToUnitType.content[zones[i].zoneDesc.type]]);
					// affect to player
					var p = players[zones[i].owner];
					u.player = p._id;
					affectUnitToZone(u,zones[i],zones[i].zoneDesc);
					
					p.units.push(u._id);
					p.money += hopMoney;
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

var processEndCheck = function(a){
	Player.find({'game':a.game._id}).sort('-point').exec(function(err, players){
		if(players[0].point >= victoryPoint){
			if(debug) console.log(players[0].name+' wins');
			a.game.winner = players[0]._id;
			a.game.save(function(err){
				if(debug) console.log(err);
			});
			Action.find({'game':a.game._id}, function(err,actions){
				for(var i=0;i<actions.length;i++){
					actions[i].status=4;
					actions[i].save();
				}
			});
		}
		syncEndProcess(a);
	});
};

var processVelovStationUpdate = function(a){
	console.log('--- Velov Update started ---');
	var xmlHttp = new XmlHttpRequest();	
	xmlHttp.open( 'GET', 'https://api.jcdecaux.com/vls/v1/stations?contract=Lyon&apiKey=d7f8e02837f368139f58a1efda258d77b8366bfe', false );
	xmlHttp.send();
	var data = JSON.parse(xmlHttp.responseText);
	var BikeStation = mongoose.model('BikeStation');
	var velovStationID = [11001, 4002, 1301, 2030, 2002, 2004, 2007, 5045, 5044, 5040, 9004, 12001, 10119, 10102, 6036,
							10072, 10031, 6007, 6044, 10117, 3082, 3099, 10113, 3090, 8002, 7062, 7061, 7007, 7020, 8051, 8061];

	var currentDate = new Date();
	var nbInsert = 0;
	var nbUpdate = 0;
	var nbNotModified = 0;
	var nbRemoved = 0;

	var mBikeStations = [];
	BikeStation.find({ 'idStation' : {$in:velovStationID}}, function(err, bikeStations)
	{
		mBikeStations = bikeStations;
		for(var i = 0; i<data.length; i++){			
			for(var j=0; j<mBikeStations.length; j++)
			{
				if(mBikeStations[j].idStation === data[i].number)
				{
					mBikeStations[j].standsAvailable = data[i].available_bike_stands;
					mBikeStations[j].bikesAvailable = data[i].available_bikes;
					mBikeStations[j].date = new Date();
					mBikeStations[j].save();
					nbUpdate++;
				}
			}
		}
		console.log('--- Velov Update finished ---');
		var diff = new Date().getTime() - currentDate.getTime();
		console.log('\tJob done in '+diff+'ms, '+currentDate);
		console.log('\t' + nbUpdate + ' update');
		console.log('\t' + nbInsert + ' insert');
		console.log('\t' + nbNotModified + ' not modified');
		console.log('\t' + nbRemoved + ' removed');	
	});
	var b = new Action({
			type:6,
			date:new Date(new Date().getTime()+updateVelovInterval)
	});
	b.save(function(err){
		syncEndProcess(a);
	});
};

/**
 *	Return the time between 2 zones with TCL
 */
function getTCLTime(departureZone, arrivalZone, currentDate)
{
	var xmlHttp = new XmlHttpRequest();
	var url = 'http://app.tcl.fr/mob_app/appli_mobile/getitineraire/android/'+
		departureZone.tclID + '/' + arrivalZone.tclID + '/' +
		currentDate.getFullYear() + '|' + (1+currentDate.getMonth()) + '|' + currentDate.getDate() + '/' +
		currentDate.getHours() + '|'  + currentDate.getMinutes() + '/1/1/0/0/0/0/0/0/0/1';
	xmlHttp.open('GET',url,false);
	xmlHttp.setRequestHeader('User-Agent','TCL Android (API 8+)');
	xmlHttp.send();
	if(xmlHttp.status === 200){
		// TODO Add Date check
		var data = JSON.parse(xmlHttp.responseText);
		try{
			var regex = /([0-9].*) minutes/;
			var duration = data.DATA.DetailsItineraire.duration;
			var match = regex.exec(duration);
			return parseInt(match[1]) * 60 * 1000;
		} catch(e) {
			return -1;
		}
	} else {
		return -1;
	}
}

/**
 * Update and persist all the TravelTime
 * symetric : Should consider that the time from A to B is the same time that from B to A
 * modeNum : 3 TODO
 */
function calculateTravelTime(modeNum, symetric) {
	if(modeNum !== 3){
		console.log('calculateTravelTime can only calculate TCL time');
		return;
	}
	console.log('--- TCL Update started ---');
	var TravelTime = mongoose.model('TravelTime');
	var ZoneDescription = mongoose.model('ZoneDescription');

	var currentDate = new Date();

	ZoneDescription.find({}).populate('adjacentZones', '_id x y tclID').exec(function (err, zonesDesc) {
		var i=0, j=0;
		var times = [];
		var nbInsert = 0;
		var nbUpdate = 0;
		var nbNotModified = 0;
		var nbRemoved = 0;

		// Generate Time between 2 zones
		for(i=0; i<zonesDesc.length;i++) {
			times[zonesDesc[i]._id] = [];
		}
     	for(i=0; i<zonesDesc.length;i++) {
			for(j=0;j<zonesDesc[i].adjacentZones.length;j++) {
				if(times[zonesDesc[i]._id][zonesDesc[i].adjacentZones[j]._id] === undefined) {
					var time = getTCLTime(zonesDesc[i], zonesDesc[i].adjacentZones[j], currentDate);
					times[zonesDesc[i]._id][zonesDesc[i].adjacentZones[j]._id] = time;
					if(symetric) {
						times[zonesDesc[i].adjacentZones[j]._id][zonesDesc[i]._id] = time;
					}
				}
			}
		}
		// Update DB
		TravelTime.find({mode:modeNum}, function (err, travelTimes) {
			//Update all existing times in DB
			var tv;
     		for(i=0; i<travelTimes.length;i++) {
				tv = travelTimes[i];
				var newTime;
				try {
					newTime = times[tv.departureZone][tv.arrivalZone];
				} catch (e) {
					// Shouldn't happen
					nbNotModified++;
					console.log('An entry cannot be found in last TCL response => Keep entry');
					continue;
				}
				if(newTime === -1) {
					tv.remove();
					nbRemoved ++;
				} else {
					tv.time = newTime;
					tv.date = currentDate;
					tv.save();
					nbUpdate ++;
				}

				// Remove Entry from times
				var index = times[tv.departureZone].indexOf(tv.arrivalZone);
				delete times[tv.departureZone][tv.arrivalZone];
				if(Object.keys(times[tv.departureZone]).length === 0) {
					delete times[tv.departureZone];
				}
			}
			// persist last travel time
	     	for(var departure in times) {
				for(var arrival in times[departure]) {
					tv = new TravelTime({
						departureZone:departure,
						arrivalZone:arrival,
						date:currentDate,
						time:times[departure][arrival],
						mode:modeNum
					});
					tv.save();
					nbInsert++;
				}
			}
			console.log('--- TCL Update finished ---');
			var diff = new Date().getTime() - currentDate.getTime();
			console.log('\tJob done in '+diff+'ms, '+currentDate);
			console.log('\t' + nbUpdate + ' update');
			console.log('\t' + nbInsert + ' insert');
			console.log('\t' + nbNotModified + ' not modified');
			console.log('\t' + nbRemoved + ' removed');	
		});
    });
}

var processTCLUpdate = function(a){
	calculateTravelTime(3, true);
	var b = new Action({
			type:7,
			date:new Date(new Date().getTime()+updateTCLInterval)
	});
	b.save(function(err){
		syncEndProcess(a);
	});
}


var actionHandlers = [];
actionHandlers.push(processDisplacement);
actionHandlers.push(processEndDisplacement);
actionHandlers.push(processInit);
actionHandlers.push(processBuy);
actionHandlers.push(processSell);
actionHandlers.push(processHop);
actionHandlers.push(processVelovStationUpdate);
actionHandlers.push(processTCLUpdate);
actionHandlers.push(processEndCheck);


// TODO
 var processAction = function(a){
	console.log('Start action '+a._id);
 	actionHandlers[a.type](a);
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
					case 6: // Velov Update
						Action.findOne({'_id':doc._id}).exec(actionCallback);
					case 7: // TCL Update
						Action.findOne({'_id':doc._id}).exec(actionCallback);
					break;
					case 8: // Hop
						Action.findOne({'_id':doc._id}).populate('game').exec(actionCallback);
					break;
				}
	    	}

	    	Action.count({'status':0, 'date':{$lte:new Date()}},function(err,count){
				//if(debug) console.log(count);
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
config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
		require(path.resolve(modelPath));
	});

Action = mongoose.model('Action');
Zone = mongoose.model('Zone');
Unit = mongoose.model('Unit');
Game = mongoose.model('Game');
Player = mongoose.model('Player');
Matrix = mongoose.model('Matrix');
ZoneDescription = mongoose.model('ZoneDescription');

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

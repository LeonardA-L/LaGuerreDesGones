'use strict';

/**
 * Module dependencies.
 */
 var mongoose = require('mongoose');

// Game action related
var registerAction=function(newAction){
	newAction.save(function(err,data){
		if (err)
			console.log(err);
		console.log('Saved');
		console.log(data);
	});
};

exports.cleanAll = function(req, res) {
	var Game = mongoose.model('Game');
	var Player = mongoose.model('Player');
	var Zone = mongoose.model('Zone');
	var Unit = mongoose.model('Unit');
	var Action = mongoose.model('Action');
	var TravelTime = mongoose.model('TravelTime');

	Game.remove({},function(){});
	Player.remove({},function(){});
	Zone.remove({},function(){});
	Unit.remove({},function(){});
	Action.remove({},function(){});
	TravelTime.remove({}, function(){});

	var ret = {
		result:'ok'
	};
	res.json(ret);
};

exports.cleanZoneDesc = function(req, res) {
	var ZoneDescription = mongoose.model('ZoneDescription');

	ZoneDescription.remove({},function(){});
	var ret = {
		result:'ok'
	};
	res.json(ret);
};

exports.getAllZoneDescs = function(req, res) {
	var ZoneDescription = mongoose.model('ZoneDescription');

    ZoneDescription.find({}, function (err, docs) {
	  if (err)
            res.send(err);

        console.log(docs);
        res.json({'success':docs}); // return all nerds in JSON format
    });
};

exports.getAllTravelTime = function(req, res) {
	var TravelTime = mongoose.model('TravelTime');

    TravelTime.find({}, function (err, docs) {
	  if (err)
            res.send(err);

        console.log(docs);
        res.json({'success':docs}); // return all nerds in JSON format
    });
};

exports.generateHop = function(req, res) {
	var ret = {
		result:'ok'
	};
	var Action = mongoose.model('Action');
	var b = new Action({
			type:5,
			game:req.params.gameId,
			date:new Date()
		});
		b.save();
	res.json(ret);
};

exports.testapi = function(req, res) {
	var ret = {
		result:'ok'
	};
	res.json(ret);
};

exports.getAllPlayers = function(req, res) {
	var Player = mongoose.model('Player');

    Player.find({}, function (err, docs) {
	  if (err)
            res.send(err);

        console.log(docs);
        res.json({'success':docs}); // return all nerds in JSON format
    });
};


// TMP : Get all games
exports.getAllGames = function(req, res) {
	var Game = mongoose.model('Game');

    Game.find({}, function (err, docs) {
	  if (err)
            res.send(err);

        console.log(docs);
        res.json({'success':docs}); // return all nerds in JSON format
    });
};

// TMP : Get all actions
exports.getAllActions = function(req, res) {
	var Action = mongoose.model('Action');

    Action.find({}, function (err, docs) {
	  if (err)
            res.send(err);

        console.log(docs);
        res.json({'success':docs}); // return all nerds in JSON format
    });
};

// TMP : Get all units
exports.getAllUnits = function(req, res) {
	var Unit = mongoose.model('Unit');

    Unit.find({}, function (err, docs) {
	  if (err)
            res.send(err);

        console.log(docs);
        res.json({'success':docs}); // return all nerds in JSON format
    });
};

// TMP : Get all zones
exports.getAllZones = function(req, res) {
	var Zone = mongoose.model('Zone');

    Zone.find({}, function (err, docs) {
	  if (err)
            res.send(err);

        console.log(docs);
        res.json({'success':docs}); // return all nerds in JSON format
    });
};

// Game Creation
exports.createGame = function(req, res) {
	// TODO rules
	var result = {
		success : true
	};
	//console.log('A new game creation request called "'+req.body.title+'" by user '+req.user.displayName);
	var Game = mongoose.model('Game');
	var Player = mongoose.model('Player');
	var Action = mongoose.model('Action');
	var ScoreBoard = mongoose.model('ScoreBoard');
	console.log(req.body);
	var g = new Game({
		'title':req.body.title,
		'nMaxPlayerUnit':40,
		'nMinPlayer':req.body.nMinPlayer,
		'nMaxPlayer':req.body.nMaxPlayer,
		'isInit':false,
		'startTime':new Date(req.body.startTime)
	});
	console.log(req.user);
	var player = new Player({
			name: req.user.username || 'Anonymous',
			isAdmin: true,
			user: req.user._id,
			game: g._id 
	});
	var scoreBoard = new ScoreBoard({
			game: g._id,
			player: player._id
	});
	g.players = [player._id];
	g.creator = req.user._id;
	player.save(function(err){
		/*if (err){
            res.send(err);
        }*/
	});
	g.save(function(err,data){
		/*if (err) {
            res.send(err);
        }*/
	});
	scoreBoard.save(function(err){
		/*if (err){
            res.send(err);
        }*/
	});
	var initAction = new Action({
		type:2,
		date:req.body.startTime,	//TODO set in future
		status:0,
		game:g._id
	});
	console.log('Registering init action');
	registerAction(initAction);
	res.json(result);
};

// Waiting room : get the games one can join
exports.getWaiting = function(req, res) {
	// TODO db request, rules
	
	var Game = mongoose.model('Game');

    Game.find({'isInit':false, 'creator._id':{$ne:req.user._id}}).populate('players','user').populate( 'creator', 'username avatarUrl').exec(function (err, docs) {
	  if (err)
            res.send(err);
        for(var i=0;i<docs.length;i++){
        	var g = docs[i];

        	if(g.players===null){
        		docs.splice(i, 1);
			i--;
			continue;
        	}

        	for(var j=0;j<g.players.length;j++){
        		if(''+g.players[j].user === ''+req.user._id){
        			docs.splice(i, 1);
				i--;
				break;
        		}
        	}
        }
        res.json({'success':docs}); // return all nerds in JSON format
    });
};

exports.getSubscribed = function(req,res){
	var Game = mongoose.model('Game');

    Game.find({}).populate('players').populate('creator', 'username').sort('winner -isInit -startTime').exec(function (err, docs) {
	  if (err)
            res.send(err);
        var accurate = [];
        for(var i=0;i<docs.length;i++){
        	var g = docs[i];
        	if(g.players===null){
        		continue;
        	}
        	for(var j=0;j<g.players.length;j++){
        		if(''+g.players[j].user === ''+req.user._id){
        			accurate.push(g);
        		}
        	}
        }
        //console.log(docs);
        res.json({'success':accurate}); // return all nerds in JSON format
    });
};

// User joins a game
exports.joinGame = function(req, res) {
	// TODO rules
	var result = {
		success : true
	};
	console.log(req.params);
	var Player = mongoose.model('Player');
	var player = new Player({
			name: req.user.username,
			user: req.user._id,
			game: req.params.gameId
	});
	player.save(function(err){
		if (err)
            res.send(err);
	});
	var Game = mongoose.model('Game');
	var gameId = req.params.gameId,
		playerID = player._id;
    Game.findByIdAndUpdate(
    gameId,
    {$push: {'players': { _id: playerID }}}, function(err){
      if(err){
       	console.log(err);
      }
    });
    var ScoreBoard = mongoose.model('ScoreBoard');
    var scoreBoardPl = new ScoreBoard({
    	game: gameId,
    	player: playerID
    });
    scoreBoardPl.save(function(err){
		if (err)
            res.send(err);
	});
	console.log('Player '+player.name+' wants to join game n°'+req.params.gameId);
console.log('Id user joined = '+player.user);
	res.json(result);
};

exports.unjoinGame = function(req, res) {
	// TODO rules
	var result = {
		success : true
	};
	console.log('Unsubscribe');
	var Game = mongoose.model('Game');
	var Player = mongoose.model('Player');
	var ScoreBoard = mongoose.model('ScoreBoard');
	// TODO possibly optimizable
	var sent = false;
	Game.findOne({'_id':req.params.gameId}).populate('players').exec(function(err,game){

		var destroyCallback = function(err){
			if(err && !sent){
				res.send(err);
				sent = true;
			}
			else if(!sent){
				res.json(result);
				sent = true;
			}
		};

		for(var i=0;i<game.players.length;i++){
			var p = game.players[i];
			console.log(p.user);
			console.log(req.user._id);
			if(''+p.user === ''+req.user._id){
				game.players.splice(i, 1);
				Player.findByIdAndRemove(p._id,destroyCallback);
				ScoreBoard.findOneAndRemove({'player':p._id},destroyCallback);
				if(game.players.length > 0){
					game.save(destroyCallback);
				}
				else{
					Game.findByIdAndRemove(game._id,destroyCallback);
				}
			}
		}
	});
};

var getPlay = function(gameId, callback, res){
	var result = {
		success:{}
	};
	var syncCallback = 8;
	var Game = mongoose.model('Game');
	var Player = mongoose.model('Player');
	var Zone = mongoose.model('Zone');
	var Unit = mongoose.model('Unit');
	var Action = mongoose.model('Action');
	var Matrix = mongoose.model('Matrix');
	var ZoneDesc = mongoose.model('ZoneDescription');
	var ChatMessage = mongoose.model('ChatMessage');

	console.log(gameId);
	Game.findOne({'_id':gameId}, function(err,game){
		if(err)
			console.log(err);
		if(res && err)
			res.send(err);
		result.success.title = game.title;
		result.success.winner = game.winner;
		result.success.creator = game.creator;
		result.success.startTime = game.startTime;
		result.success.nMaxPlayerUnit = game.nMaxPlayerUnit;

		if(--syncCallback === 0){
			callback(result);
		}
	});
	Unit.find({'game':gameId}, function(err,units){
		if(res && err)
			res.send(err);
		result.success.units = units;
		if(--syncCallback === 0){
			callback(result);
		}
	});
	Zone.find({'game':gameId}).exec(function(err,zones){
		if(res && err)
			res.send(err);
		result.success.zones = zones;
		if(--syncCallback === 0){
			callback(result);
		}
	});
	ZoneDesc.find({}).exec(function(err,zonesDesc){
		if(res && err)
			res.send(err);
		result.success.zonesDesc = {};
		for(var i=0;i<zonesDesc.length;i++){
			result.success.zonesDesc[zonesDesc[i]._id] = zonesDesc[i];
		}
		if(--syncCallback === 0){
			callback(result);
		}
	});
	Player.find({'game':gameId}).populate('user', 'avatarUrl').sort('-point').exec(function(err,players){
		if(res && err)
			res.send(err);
		result.success.players = players;
		if(--syncCallback === 0){
			callback(result);
		}
	});
	Action.find({'game':gameId}).sort('-date').exec(function(err,actions){
		if(res && err)
			res.send(err);
		result.success.actions = actions;
		if(--syncCallback === 0){
			callback(result);
		}
	});

	Matrix.find({'name':{$in:['UnitData']}},function(err,matrixes){
		if(res && err)
			res.send(err);
		result.success.matrixes = {};
		for(var i=0;i<matrixes.length;i++){
			result.success.matrixes[matrixes[i].name] = matrixes[i];
		}
		if(--syncCallback === 0){
			callback(result);
		}
	});
	
	ChatMessage.find({'game':gameId}, function(err,chatMessages){
		console.log('################## Chat Message #################');
		console.log(chatMessages);
		console.log('################## Fin Chat Message #################');
		if(res && err)
			res.send(err);
		result.success.chatMessages = chatMessages;
		if(--syncCallback === 0){
			callback(result);
		}
	});
};

exports.startPlay = function(req,res){
	var handleReq = function(result){
		res.json(result);
	};
	getPlay(req.params.gameId,handleReq, res);
};

var diffPlay = function(){
	
};

exports.displacementAction = function(req, res) {

	// TODO rules


	var Action = mongoose.model('Action');

	console.log(req.body);
	var a = new Action ({
		type:0,
		date:new Date(),
		status:0,
		game: req.body.gameId,
		zoneA:req.body.zoneAId,
		zoneB:req.body.zoneBId,
		units:req.body.unitIds
	});
	console.log('registering disp');
	console.log(a);
	registerAction(a);
};

exports.sellAction = function(req, res) {

	// TODO rules

	var Action = mongoose.model('Action');

	console.log(req.body);
	var a = new Action ({
		type:4,
		date:new Date(),
		status:0,
		zone:req.body.zone,
		units:[req.body.unit],
		player:req.body.player,
		game:req.body.game
	});
	console.log('registering sell');
	console.log(a);
	registerAction(a);

	var ret = {
		result:'ok'
	};
	res.json(ret);
};

exports.buyAction = function(req, res) {

	// TODO rules

	var Action = mongoose.model('Action');

	console.log(req.body);
	var a = new Action ({
		type:3,
		date:new Date(),
		status:0,
		zone:req.body.zone,
		player:req.body.player,
		newUnitType : req.body.newUnitType,
		game:req.body.game
	});
	console.log('registering buy');
	console.log(a);
	registerAction(a);

	var ret = {
		result:'ok'
	};
	res.json(ret);
};

//TODO ----------------------------------------------------------------------------------------------------------------------------------------------  CLEAN

//TODO ----------------------------------------------------------------------------------------------------------------------------------------------  CLEAN

exports.firstUseFillBDD = function(req,res){
	/*
	// First use : fill BDD
	*/
	var Matrix = mongoose.model('Matrix');
	Matrix.remove({'name':{$in:['UnitData','ZoneTypeToUnitType']}},function(err,data){
		var unitData = new Matrix({
			name:'UnitData',
			content :[{
				type:0,
				attack:1,
				defence:1,
				point:1,
				price:10,
				name:'Lyonnais'
			},
			{
				type:1,
				attack:1,
				defence:2,
				point:2,
				price:20,
				name:'Touriste'
			},
			{
				type:2,
				attack:4,
				defence:1,
				point:3,
				price:40,
				name:'Etudiant'
			},
			{
				type:3,
				attack:1,
				defence:2,
				point:2,
				price:20,
				name:'Joggeur'
			},
			{
				type:4,
				attack:2,
				defence:1,
				point:2,
				price:20,
				name:'Joggeur'
			},
			{
				type:5,
				attack:1,
				defence:4,
				point:3,
				price:40,
				name:'Médecin'
			},
			{
				type:6,
				attack:1,
				defence:1,
				point:2,
				price:30,
				name:'Prête'
			},
			{
				type:7,
				attack:3,
				defence:2,
				point:3,
				price:45,
				name:'Scientifique'
			}]
		});
		unitData.save();

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

		var zoneTypeToUnitType = new Matrix({
		name:'ZoneTypeToUnitType',
		content :{
			neutral : 0,
			hospital : 5,
			park : 3,
			university : 2,
			curch : 6,
			woodstock : 3,
			station : 1,
			airport : 1,
			city_hall:0,
			square:0,
			shopping_centre:0,
			bank:7
		}});
		zoneTypeToUnitType.save();
	
		var BikeStation = mongoose.model('BikeStation');
		var velovStationID = [11001, 4002, 1301, 2030, 2002, 2004, 2007, 5045, 5044, 5040, 9004, 12001, 10119, 10102, 6036,
								10072, 10031, 6007, 6044, 10117, 3082, 3099, 10113, 3090, 8002, 7062, 7061, 7007, 7020, 8051, 8061];

		for(var i = 0; i<velovStationID.length; i++){
			var bikeStation = new BikeStation({
				idStation:velovStationID[i],
				date:new Date()
			});

			bikeStation.save();
		}
	});
	var Action = mongoose.model('Action');
	Action.count({'type':6},function(err,count){
		if(count === 0){
			var a = new Action({
				type:6,
				date:new Date()
			});
			a.save();
		}
	});
	Action.count({'type':7},function(err,count){
		if(count === 0){
			var b = new Action({
				type:7,
				date:new Date()
			});
			b.save();
		}
	});

	var ret = {
		result:'ok'
	};
	res.json(ret);
};



exports.actionCallback = function(req,res){
	console.log('A game was saved');
	console.log(req.body);
	var handleDiff = function(diff){
		console.log('New diff');
		// TODO socketio
		var socketio = req.app.get('socketio'); // take out socket instance from the app container
		socketio.sockets.emit(req.body.game+'.diff', diff); // emit an event for all connected clients
	};
	getPlay(req.body.game,handleDiff);
	var ret = {
		result:'ok'
	};
	res.json(ret);
};

// Chat message
exports.sendMessage = function(req,res){
	console.log('Sending a message in the chat');
	
	var ChatMessage = mongoose.model('ChatMessage');

	var cm = new ChatMessage({
		game: req.body.game,
		player:req.body.player,
		message:req.body.message,
		date:req.body.date
    });
	console.log('###### New Message #####\n' + cm + '\n##### END OF MESSAGE #####');
	cm.save(function(err,data){
		ChatMessage.find({'game':req.body.game}, function(err,chatMessages){
			var socketio = req.app.get('socketio'); // take out socket instance from the app container
			socketio.sockets.emit(req.body.game+'.chat', chatMessages); // emit an event for all connected clients
		});		
	});
};

//Display game scoreboard 
exports.displayScoreBoard = function(req, res) {
	// TODO rules
	var ScoreBoard = mongoose.model('ScoreBoard');
	var Player = mongoose.model('Player');
	var Matrix = mongoose.model('Matrix'),
	unitDataMatrix = Matrix.findOne({'name':'UnitData'});
	var gameId = req.params.gameId;
	var nbUnitTypes = 8;
	var scoreBoard = [];
	ScoreBoard.find({game : gameId}).populate('player zones objectives').exec(function(err, docs){
		// if (err)
		// 	res.send(err);
		docs.sort(function(pl1,pl2){
			return pl2.money - pl1.money;
		});
		docs.sort(function(pl1,pl2){
			return pl2.point - pl1.point;
		});
		for (var i=0; i<docs.length; i++){
			var player = {};
			player.username = docs[i].player.name;
			player.point = docs[i].player.point;
			player.money = docs[i].player.money;
			// player.zones = docs[i].zones;
			// player.objectives = docs[i].objectives;
			// var unitTypes = [];
			// for (var j=0; j< nbUnitTypes; j++){
			// 	var units = {};
			// 	units.nbKills = docs[i].getKillsByUnitType(j);
			// 	units.nbSurvivors = docs[i].getSurvivorsByUnitType(j);
			// 	units.name = unitDataMatrix.content[j].name;
			// 	unitTypes.push(units);
			// }
			// player.unitTypes=unitTypes;
			scoreBoard.push(player);
		}
		res.json({'success':scoreBoard});
	});
};


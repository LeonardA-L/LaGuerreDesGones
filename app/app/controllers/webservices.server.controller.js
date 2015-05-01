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
	//var ZoneDescription = mongoose.model('ZoneDescription');

	Game.remove({},function(){});
	Player.remove({},function(){});
	Zone.remove({},function(){});
	Unit.remove({},function(){});
	Action.remove({},function(){});
	//ZoneDescription.remove({},function(){});
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
	var g = new Game({
		'title':req.body.title,
		'nMaxPlayerUnit':40,
		'nMinPlayer':2,
		'nMaxPlayer':8,
		'isInit':false,
		'startTime':new Date(req.body.startTime)
	});
	console.log(g);
	var player = new Player({
			name: req.user.nickname || 'Anonymous',
			isAdmin: true,
			user: req.user._id,
			game: g._id 
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

    Game.find({'isInit':false, 'creator._id':{$ne:req.user._id}}).populate('players').exec(function (err, docs) {
	  if (err)
            res.send(err);
        for(var i=0;i<docs.length;i++){
        	var g = docs[i];
        	if(g.players===null){
        		docs.splice(i, 1);
        		continue;
        	}
        	for(var j=0;j<g.players.length;j++){
        		if(''+g.players[j].user === ''+req.user._id){
        			docs.splice(i, 1);
        		}
        	}
        }
        //console.log(docs);
        res.json({'success':docs}); // return all nerds in JSON format
    });
};

exports.getSubscribed = function(req,res){
	var Game = mongoose.model('Game');

    Game.find({}).populate('players').exec(function (err, docs) {
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
	console.log('Player '+player.name+' wants to join game n°'+req.params.gameId);
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
	// TODO possibly optimizable
	Game.findOne({'_id':req.params.gameId}).populate('players').exec(function(err,game){
		if(err)
			res.send(err);

		var destroyCallback = function(err){
			if(err)
				res.send(err);
		};

		for(var i=0;i<game.players.length;i++){
			var p = game.players[i];
			console.log(p.user);
			console.log(req.user._id);
			if(''+p.user === ''+req.user._id){
				game.players.splice(i, 1);
				Player.findByIdAndRemove(p._id,destroyCallback);
				if(game.players.length > 0){
					game.save(destroyCallback);
				}
				else{
					Game.findByIdAndRemove(game._id,destroyCallback);
				}
			}
		}
	});
	res.json(result);
};

exports.startPlay = function(req,res){
	var result = {
		success:{}
	};
	var syncCallback = 7;
	var Game = mongoose.model('Game');
	var Player = mongoose.model('Player');
	var Zone = mongoose.model('Zone');
	var Unit = mongoose.model('Unit');
	var Action = mongoose.model('Action');
	var Matrix = mongoose.model('Matrix');
	var ZoneDesc = mongoose.model('ZoneDescription');

	console.log(req.params.gameId);
	Game.findOne({'_id':req.params.gameId}, function(err,game){
		if(err)
			res.send(err);
		result.success.title = game.title;
		if(--syncCallback === 0){
			res.json(result);
		}
	});
	Unit.find({'game':req.params.gameId}, function(err,units){
		if(err)
			res.send(err);
		result.success.units = units;
		if(--syncCallback === 0){
			res.json(result);
		}
	});
	Zone.find({'game':req.params.gameId}).exec(function(err,zones){
		if(err)
			res.send(err);
		result.success.zones = zones;
		if(--syncCallback === 0){
			res.json(result);
		}
	});
	ZoneDesc.find({}).exec(function(err,zonesDesc){
		if(err)
			res.send(err);
		result.success.zonesDesc = {};
		for(var i=0;i<zonesDesc.length;i++){
			result.success.zonesDesc[zonesDesc[i]._id] = zonesDesc[i];
		}
		if(--syncCallback === 0){
			res.json(result);
		}
	});
	Player.find({'game':req.params.gameId}, function(err,players){
		if(err)
			res.send(err);
		result.success.players = players;
		if(--syncCallback === 0){
			res.json(result);
		}
	});
	Action.find({'game':req.params.gameId}, function(err,actions){
		if(err)
			res.send(err);
		result.success.actions = actions;
		if(--syncCallback === 0){
			res.json(result);
		}
	});

	Matrix.find({'name':{$in:['UnitData']}},function(err,matrixes){
		if(err)
			res.send(err);
		result.success.matrixes = {};
		for(var i=0;i<matrixes.length;i++){
			result.success.matrixes[matrixes[i].name] = matrixes[i];
		}
		if(--syncCallback === 0){
			res.json(result);
		}
	});
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
		player:req.body.player
	});
	console.log('registering sell');
	console.log(a);
	registerAction(a);
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
		newUnitType : req.body.newUnitType
	});
	console.log('registering buy');
	console.log(a);
	registerAction(a);
};

exports.firstUseFillBDD = function(req,res){
/*
// First use : fill BDD
*/
var Matrix = mongoose.model('Matrix');
Matrix.remove({'name':{$in:['UnitData']}},function(err,data){
	var unitData = new Matrix({
		name:'UnitData',
		content :[{
			type:0,
			attack:1,
			defense:1,
			point:1,
			price:10,
			name:'Lyonnais'
		},
		{
			type:1,
			attack:1,
			defense:2,
			point:2,
			price:20,
			name:'Cycliste'
		},
		{
			type:2,
			attack:4,
			defense:1,
			point:3,
			price:40,
			name:'Etudiant'
		},
		{
			type:3,
			attack:1,
			defense:2,
			point:2,
			price:20,
			name:'Hippie'
		},
		{
			type:4,
			attack:2,
			defense:1,
			point:2,
			price:20,
			name:'Joggeur'
		},
		{
			type:5,
			attack:1,
			defense:4,
			point:3,
			price:40,
			name:'Médecin'
		},
		{
			type:6,
			attack:1,
			defense:1,
			point:2,
			price:30,
			name:'Prête'
		},
		{
			type:7,
			attack:3,
			defense:2,
			point:3,
			price:45,
			name:'Scientifique'
		}]
	});
	unitData.save();
});
};
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

exports.testapi = function(req, res) {
	var ret = {
		result:'ok'
	};
	res.json(ret);
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
        		console.log(g.players[j].user);
        		console.log(req.user._id);
        		if(''+g.players[j].user === ''+req.user._id){
        			docs.splice(i, 1);
        		}
        	}
        }
        //console.log(docs);
        res.json({'success':docs}); // return all nerds in JSON format
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
	var syncCallback = 3;
	var Game = mongoose.model('Game');
	var Player = mongoose.model('Player');
	var Zone = mongoose.model('Zone');
	var Unit = mongoose.model('Unit');

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
	Zone.find({'game':req.params.gameId}, function(err,zones){
		if(err)
			res.send(err);
		result.success.zones = zones;
		if(--syncCallback === 0){
			res.json(result);
		}
	});
	// TODO players
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

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
	var player = new Player({
			name: req.user.nickname || 'Anonymous',
			isAdmin: true,
			user: req.user._id,
			game: g._id 
	});

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

    Game.find({}, function (err, docs) {
	  if (err)
            res.send(err);

        console.log(docs);
        res.json({'success':docs}); // return all nerds in JSON format
    });
	// Dummy list
	/*
	var ret = {
		success:[{
			'id':42,
			'startTime' : 1430234252,
			'title':'Les joyeux lyonnais',
			'creator' : 'LeonardA-L'
		},
		{
			'id':1337,
			'startTime' : 1430236252,
			'title':'Par ici les gonnettes',
			'creator' : 'LeonardA-L'
		}]
	};
	*/
};

// User joins a game
exports.joinGame = function(req, res) {
	// TODO rules
	var result = {
		success : true
	};
	console.log('User '+req.user.displayName+' wants to join game n°'+req.params.gameId);
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

	Game.find({'_id':req.params.gameId}, function(err,game){
		if(err)
			res.send(err);
		result.success.title = game.title;
		syncCallback--;
		if(syncCallback === 0){
			res.json(result);
		}
	});
	Unit.find({'game':req.params.gameId}, function(err,units){
		if(err)
			res.send(err);
		result.success.units = units;
		syncCallback--;
		if(syncCallback === 0){
			res.json(result);
		}
	});
	Zone.find({'game':req.params.gameId}, function(err,zones){
		if(err)
			res.send(err);
		result.success.zones = zones;
		syncCallback--;
		if(syncCallback === 0){
			res.json(result);
		}
	});
	// TODO players
};


exports.displacementAction = function(req, res) {

	// TODO rules


	var Action = mongoose.model('Action');


	var a = new Action ({
		type:0,
		date:new Date(),
		status:0,
		game: req.body.gameId
	});

	var Zone = mongoose.model('Zone');
	var Unit = mongoose.model('Unit');
	if(req.body.test){
		// DUMMY
		var zdA = new Zone({
			x:10,
			y:15
		});
		var zdB = new Zone({
			x:20,
			y:25
		});
		var ud = new Unit();
		zdA.save();
		zdB.save();
		ud.save();

		req.body.zoneAId = zdA._id;
		req.body.zoneBId = zdB._id;
		req.body.unitIds = [ud._id];
	}
	console.log(req.body);

	var syncCallback = 2;

	setTimeout(function(){

	    Zone.find({'_id':{$in:[req.body.zoneAId, req.body.zoneBId]}}, function (err, zones) {
	    	syncCallback--;
		  	if (err) {
	            res.send(err);
	       	}
	       	if(zones[0]._id === req.body.zoneAId){
	       		a.zoneA = zones[0];
	       		a.zoneB = zones[1];
	       	}
	       	else{
	       		a.zoneA = zones[1];
	       		a.zoneB = zones[0];
	       	}
	       	if (0===syncCallback) {
	       		registerAction(a);
	       	}
	    });

	    Unit.find({'_id':{$in:req.body.unitIds}}, function (err, units) {
	    	syncCallback--;
		  	if (err) {
	            res.send(err);
	      	}
	      	a.units = units;
	      	if (0===syncCallback) {
	       		registerAction(a);
	       	}
	    });

	},30);
};

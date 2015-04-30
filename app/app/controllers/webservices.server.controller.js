'use strict';

/**
 * Module dependencies.
 */
 var mongoose = require('mongoose');

exports.testapi = function(req, res) {
	var ret = {
		result:'ok'
	};
	res.json(ret);
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
	var g = new Game({
		'title':req.body.title,
		'nMaxPlayerUnit':40,
		'nMaxPlayer':6,
		'isInit':false,
		'startTime':new Date(req.body.startTime)
	});
	g.save(function(err,data){
		if (err) {
            res.send(err);
        }
        else {
        	var player = new Player({
					name: req.body.playername,
					isAdmin: true,
					user: req.user._id,
					game: g._id 
			});
			player.save(function(err){
				if (err)
		            res.send(err);
			});
        }
	});
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


// Game action related
var registerAction=function(newAction){
	newAction.save(function(err,data){
		if (err)
			console.log(err);
	});
};

exports.displacementAction = function(req, res) {
	var Action = mongoose.model('Action');
	var a = new Action ({
		type:0,
		date:new Date(),
		status:0,
		gameId: req.body.gameId
	});

	var Zone = mongoose.model('Zone');
	var Unit = mongoose.model('Unit');

	var syncCallback = 2;

    Zone.find({'_id':{$in:[req.body.zoneAId, req.body.zoneBId]}}, function (err, zones) {
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
       	if (0===syncCallback--) {
       		registerAction(a);
       	}
    });

    Unit.find({'_id':{$in:req.body.unitIds}}, function (err, units) {
	  	if (err) {
            res.send(err);
      	}
      	a.units = units;
      	if (0===syncCallback--) {
       		registerAction(a);
       	}
    });
};

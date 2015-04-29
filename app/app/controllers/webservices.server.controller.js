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
		if (err)
            res.send(err)
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
'use strict';

/**
 * Module dependencies.
 */
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
	console.log('A new game creation request called "'+req.body.title+'" by user '+req.user.displayName);
	res.json(result);
};

// Waiting room : get the games one can join
exports.getWaiting = function(req, res) {
	// TODO db request, rules
	// Dummy list
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
	res.json(ret);
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
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

exports.createGame = function(req, res) {
	var result = {
		success : true
	};
	console.log('A new game creation request called "'+req.body.title+'" by user '+req.user.displayName);
	res.json(result);
};
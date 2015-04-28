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
	console.log('A new game creation request for '+req.body.startTime+' by user '+req.user.displayName);
	res.json(result);
};
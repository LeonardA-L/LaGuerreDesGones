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
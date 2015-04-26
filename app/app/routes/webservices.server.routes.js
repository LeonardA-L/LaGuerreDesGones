'use strict';

module.exports = function(app) {
	// Root routing
	var webservices = require('../../app/controllers/webservices.server.controller');
	app.route('/services/testapi').get(webservices.testapi);
};
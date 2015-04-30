'use strict';

module.exports = function(app) {
	// Root routing
	var webservices = require('../../app/controllers/webservices.server.controller');
	app.route('/services/testapi').get(webservices.testapi);

	// Game Creation
	app.route('/services/game/create').post(webservices.createGame);
	// Waiting room : get the games one can join
	app.route('/services/game/getWaiting').get(webservices.getWaiting);
	// User subscribes to a game
	app.route('/services/game/:gameId/join').get(webservices.joinGame);

	app.route('/services/action/disp').get(webservices.displacementAction);

	app.route('/services/api/games').get(webservices.getAllGames);
	app.route('/services/api/actions').get(webservices.getAllActions);
	app.route('/services/api/units').get(webservices.getAllUnits);
	app.route('/services/api/zones').get(webservices.getAllZones);

};

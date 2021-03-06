'use strict';

module.exports = function(app) {
	// Root routing
	var webservices = require('../../app/controllers/webservices.server.controller');
	app.route('/services/testapi').get(webservices.testapi);

	// Game Creation
	app.route('/services/game/create').post(webservices.createGame);
	// Waiting room : get the games one can join
	app.route('/services/game/getWaiting').get(webservices.getWaiting);
	app.route('/services/game/getSubscribed').get(webservices.getSubscribed);
	// User subscribes to a game
	app.route('/services/game/:gameId/join').get(webservices.joinGame);
	app.route('/services/game/:gameId/unjoin').get(webservices.unjoinGame);
	// Game Scoreboard
	app.route('/services/game/:gameId/scoreBoard').get(webservices.displayScoreBoard);

	app.route('/services/api/games').get(webservices.getAllGames);
	app.route('/services/api/actions').get(webservices.getAllActions);
	app.route('/services/api/units').get(webservices.getAllUnits);
	app.route('/services/api/zones').get(webservices.getAllZones);
	app.route('/services/api/zoneDescs').get(webservices.getAllZoneDescs);
	app.route('/services/api/players').get(webservices.getAllPlayers);
	app.route('/services/api/travelTime').get(webservices.getAllTravelTime);
	app.route('/services/api/generateHop/:gameId').get(webservices.generateHop);
	app.route('/services/api/cleanAll').get(webservices.cleanAll);
	app.route('/services/api/cleanZoneDesc').get(webservices.cleanZoneDesc);

	app.route('/services/play/:gameId/start').get(webservices.startPlay);

	app.route('/services/action/disp').post(webservices.displacementAction);
	app.route('/services/action/sell').post(webservices.sellAction);
	app.route('/services/action/buy').post(webservices.buyAction);

	app.route('/services/play/callback').post(webservices.actionCallback);	

	app.route('/services/firstUse').get(webservices.firstUseFillBDD);

	app.route('/services/chat/send').post(webservices.sendMessage);		
};

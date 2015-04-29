'use strict';
/**
 * Module dependencies.
 */
var init = require('../app/config/init')(),
	config = require('../app/config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk');

var Action = require('../app/app/models/action.server.model');
/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
console.log('Connecting to mongo '+config.db);
var db = mongoose.connect(config.db, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});


// Logging initialization
console.log('Action processor started');

'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk'),
	schedule = require('node-schedule'),
    XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

/**
* Recupererer service
* Traiter le resultat (parser, maj des infos....)
* Persistance dans la base
*/
function registerCronJob(serviceAddress, resultTreatment, cronMinutesInterval)
{  
	console.log(serviceAddress);
	console.log(cronMinutesInterval+' * * * *');
	var cron = schedule.scheduleJob(cronMinutesInterval+' * * * *', function(){
		console.log(new Date());
		var xmlHttp = new XMLHttpRequest();	
		xmlHttp.open( 'GET', serviceAddress, false );
		xmlHttp.send();
		console.log('response '+xmlHttp.responseText);
		var data = JSON.parse(xmlHttp.responseText);
		console.log(data);
		//var result = resultTreatment(data);
		//On persiste les infos dans la base
		});
}

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect(config.db, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});

// Init the express application
var app = require('./config/express')(db);

// Bootstrap passport config
require('./config/passport')();

// Start the app by listening on <port>
app.listen(config.port);

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('MEAN.JS application started on port ' + config.port);

registerCronJob('http://dfournier.ovh/api/tag/?format=json', null, '*');


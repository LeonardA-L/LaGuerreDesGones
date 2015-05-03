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

function velovProcess(data)
{
	var velovStationID = [11001, 4002, 1301, 2030, 2002, 2004, 2007, 5045, 5044, 5040, 9004, 12001, 10119, 10102, 6036,
							10072, 10031, 6007, 6044, 10117, 3082, 3099, 10113, 3090, 8002, 7062, 7061, 7007, 7020, 8051, 8061];
	var stationsToKeep = [];
	for(var i = 0; i<data.length; i++){
		if(velovStationID.indexOf(data[i].number) > -1){
			stationsToKeep.push([data[i].number, data[i].available_bike_stands, data[i].available_bikes]);
		}
	}
	console.log(stationsToKeep);
	return stationsToKeep;
}

function travelTime(latitudeDep, longitudeDep, latitudeArr, longitudeArr, mode)
{
	var xmlHttp = new XMLHttpRequest();	
	xmlHttp.open( 'GET', 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='+latitudeDep+','+longitudeDep+
					'&destinations='+latitudeArr+','+longitudeArr+'&mode='+mode+'&key=AIzaSyAHDzUFLgSp1qwdZZPnQpYtkRxF9r1gk0A', false );
	xmlHttp.send();
	var data = JSON.parse(xmlHttp.responseText);

}


/**
* Recupererer service
* Traiter le resultat (parser, maj des infos....)
* Persistance dans la base
*/
function registerCronJob(serviceAddress, resultTreatment, cronMinutesInterval)
{  
	var cron = schedule.scheduleJob(cronMinutesInterval+' * * * *', function(){
		var xmlHttp = new XMLHttpRequest();	
		xmlHttp.open( 'GET', serviceAddress, false );
		xmlHttp.send();
		var data = JSON.parse(xmlHttp.responseText);
		var result = resultTreatment(data);
		//On persiste dans la base
		});
}

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

registerCronJob('https://api.jcdecaux.com/vls/v1/stations?contract=Lyon&apiKey=d7f8e02837f368139f58a1efda258d77b8366bfe', velovProcess, '*');


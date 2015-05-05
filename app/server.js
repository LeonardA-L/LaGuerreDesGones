'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk'),
	cronjob = require('./app/controllers/cronjob.server.controller');

function getTCLTime(departureZone, arrivalZone, currentDate)
{
	var xmlHttp = new XmlHttpRequest();
	var url = 'http://app.tcl.fr/mob_app/appli_mobile/getitineraire/android/'+
		departureZone.tclID + '/' + arrivalZone.tclID + '/' +
		currentDate.getFullYear() + '|' + (1+currentDate.getMonth()) + '|' + currentDate.getDate() + '/' +
		currentDate.getHours() + '|'  + currentDate.getMinutes() + '/1/1/0/0/0/0/0/0/0/1';
	xmlHttp.open('GET',url,false);
	xmlHttp.setRequestHeader('User-Agent','TCL Android (API 8+)');
	xmlHttp.send();
	if(xmlHttp.status === 200){
		// TODO Add Date check
		var data = JSON.parse(xmlHttp.responseText);
		try{
			var regex = /([0-9].*) minutes/;
			var duration = data.DATA.DetailsItineraire.duration;
			var match = regex.exec(duration);
			return parseInt(match[1]) * 60 * 1000;
		} catch(e) {
			return -1;
		}
	} else {
		return -1;
	}
}

function calculateTravelTime(modeNum, symetric) {
	var TravelTime = mongoose.model('TravelTime');
	var ZoneDescription = mongoose.model('ZoneDescription');

	var currentDate = new Date();
	console.log('--- TCL Update started ---');
	ZoneDescription.find({}).populate('adjacentZones', '_id x y tclID').exec(function (err, zonesDesc) {
		var i=0, j=0;
		var times = [];
		var nbInsert = 0;
		var nbUpdate = 0;
		var nbNotModified = 0;
		var nbRemoved = 0;

		// Generate Time between 2 zones
		for(i=0; i<zonesDesc.length;i++) {
			times[zonesDesc[i]._id] = [];
		}
     	for(i=0; i<zonesDesc.length;i++) {
			for(j=0;j<zonesDesc[i].adjacentZones.length;j++) {
				if(times[zonesDesc[i]._id][zonesDesc[i].adjacentZones[j]._id] === undefined) {
					var time = getTCLTime(zonesDesc[i], zonesDesc[i].adjacentZones[j], currentDate);
					times[zonesDesc[i]._id][zonesDesc[i].adjacentZones[j]._id] = time;
					if(symetric) {
						times[zonesDesc[i].adjacentZones[j]._id][zonesDesc[i]._id] = time;
					}
				}
			}
		}
		// Update DB
		TravelTime.find({mode:modeNum}, function (err, travelTimes) {
			//Update all existing times in DB
			var tv;
     		for(i=0; i<travelTimes.length;i++) {
				tv = travelTimes[i];
				var newTime;
				try {
					newTime = times[tv.departureZone][tv.arrivalZone];
				} catch (e) {
					// Shouldn't happen
					nbNotModified++;
					console.log('An entry cannot be found in last TCL response => Keep entry');
					continue;
				}
				if(newTime === -1) {
					tv.remove();
					nbRemoved ++;
				} else {
					tv.time = newTime;
					tv.date = currentDate;
					tv.save();
					nbUpdate ++;
				}

				// Remove Entry from times
				var index = times[tv.departureZone].indexOf(tv.arrivalZone);
				delete times[tv.departureZone][tv.arrivalZone];
				if(Object.keys(times[tv.departureZone]).length === 0) {
					delete times[tv.departureZone];
				}
			}
	     	for(var departure in times) {
				for(var arrival in times[departure]) {
					tv = new TravelTime({
						departureZone:departure,
						arrivalZone:arrival,
						date:currentDate,
						time:times[departure][arrival],
						mode:modeNum
					});
					tv.save();
					nbInsert++;
				}
			}
			console.log('--- TCL Update finished ---');
			var diff = new Date().getTime() - currentDate.getTime();
			console.log('\tJob done in '+diff+'ms, '+currentDate);
			console.log('\t' + nbUpdate + ' update');
			console.log('\t' + nbInsert + ' insert');
			console.log('\t' + nbNotModified + ' not modified');
			console.log('\t' + nbRemoved + ' removed');	
		});
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
app.get('server').listen(config.port);

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('MEAN.JS application started on port ' + config.port);

//calculateTravelTime(3, true);

cronjob.registerCronJob('https://api.jcdecaux.com/vls/v1/stations?contract=Lyon&apiKey=d7f8e02837f368139f58a1efda258d77b8366bfe', cronjob.velovProcess, '*');




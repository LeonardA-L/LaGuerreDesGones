'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk'),
	schedule = require('node-schedule'),
	XmlHttpRequest = require('xmlhttprequest').XMLHttpRequest;
	

function velovProcess(data)
{
	var BikeStation = mongoose.model('BikeStation');
	var velovStationID = [11001, 4002, 1301, 2030, 2002, 2004, 2007, 5045, 5044, 5040, 9004, 12001, 10119, 10102, 6036,
							10072, 10031, 6007, 6044, 10117, 3082, 3099, 10113, 3090, 8002, 7062, 7061, 7007, 7020, 8051, 8061];

	var mBikeStations = [];
	BikeStation.find({ 'idStation' : {$in:velovStationID}}, function(err, bikeStations)
	{
		mBikeStations = bikeStations;
		console.log(mBikeStations);
		for(var i = 0; i<data.length; i++){			
			for(var j=0; j<mBikeStations.length; j++)
			{
				console.log('COMPARING  ' + mBikeStations[j].idStation + ' WITH ' + data[i].number);
				if(mBikeStations[j].idStation === data[i].number)
				{
					mBikeStations[j].standsAvailable = data[i].available_bike_stands;
					mBikeStations[j].bikesAvailable = data[i].available_bikes;
					mBikeStations[j].date = new Date();
					console.log(data[i].available_bike_stands);
					mBikeStations[j].save();
					console.log(mBikeStations[j]+' SAUVEGARDE !!!!!');
				}
			}
	}
});
	
	
	
}

function persistAllBikeStations()
{
	var BikeStation = mongoose.model('BikeStation');
	var velovStationID = [11001, 4002, 1301, 2030, 2002, 2004, 2007, 5045, 5044, 5040, 9004, 12001, 10119, 10102, 6036,
							10072, 10031, 6007, 6044, 10117, 3082, 3099, 10113, 3090, 8002, 7062, 7061, 7007, 7020, 8051, 8061];

	for(var i = 0; i<velovStationID.length; i++){
		var bikeStation = new BikeStation({
			idStation:velovStationID[i],
			date:new Date()
		});

		bikeStation.save();
	}
}

function travelTime(latitudeDep, longitudeDep, latitudeArr, longitudeArr, mode)
{
	var xmlHttp = new XmlHttpRequest();	
	xmlHttp.open( 'GET', 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='+latitudeDep+','+longitudeDep+
					'&destinations='+latitudeArr+','+longitudeArr+'&mode='+mode+'&key=AIzaSyAHDzUFLgSp1qwdZZPnQpYtkRxF9r1gk0A', false );
	xmlHttp.send();
	var data = JSON.parse(xmlHttp.responseText);
	return data.rows[0].elements[0].duration.value;
}

function calculAllTravelTimes(mode)
{
	 var zoneDescription = mongoose.model('ZoneDescription');
	 var TravelTime = mongoose.model('TravelTime');
	
	 zoneDescription.find({}, function(err, zonesDesc) {
     	for(var i=1; i<zonesDesc.length;i++)
		{
			for(var j=1;j<zonesDesc[i].adjacentZones.length;j++)
			{
				var t_time = travelTime(zonesDesc[i].y,zonesDesc[i].x,zonesDesc.adjacentZones[j].y,zonesDesc.adjacentZones[j].x,mode);
				var m_mode;
				switch(mode)
				{
					case 'walking' :
						m_mode = 2;
						break;
					case 'bicycling' :
						m_mode = 1;
						break;
				}				
				var t_travelTime = new TravelTime({
					departureZone:zonesDesc[i]._id,
					arrivalZone:zonesDesc[i].adjacentZones[j]._id,
					date:new Date(),
					time:t_time,
					mode:m_mode
				});
				t_travelTime.save();
			}
			
		}	
     });
}


function calculateTravelTime(modeNum, symetric) {
	var TravelTime = mongoose.model('TravelTime');
	var ZoneDescription = mongoose.model('ZoneDescription');

	var currentDate = new Date();

	ZoneDescription.find({}).populate('adjacentZones', '_id x y').exec(function (err, zonesDesc) {
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
				if(times[zonesDesc[i]._id][zonesDesc[i].adjacentZones._id] === undefined) {
					var time = 60*1000;
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
* Recupererer service
* Traiter le resultat (parser, maj des infos....)
* Persistance dans la base
*/
function registerCronJob(serviceAddress, resultTreatment, cronMinutesInterval)
{  
	var cron = schedule.scheduleJob(cronMinutesInterval+' * * * *', function(){
		var xmlHttp = new XmlHttpRequest();	
		xmlHttp.open( 'GET', serviceAddress, false );
		xmlHttp.send();
		var data = JSON.parse(xmlHttp.responseText);
		var result = resultTreatment(data);
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

calculateTravelTime(3, true);

//persistAllBikeStations();
//registerCronJob('https://api.jcdecaux.com/vls/v1/stations?contract=Lyon&apiKey=d7f8e02837f368139f58a1efda258d77b8366bfe', velovProcess, '*');




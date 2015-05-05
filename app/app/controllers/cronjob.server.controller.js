'use strict';

/**
 * Module dependencies.
 */
var schedule = require('node-schedule'),
XmlHttpRequest = require('xmlhttprequest').XMLHttpRequest,
mongoose = require('mongoose');


exports.velovProcess = function(data){
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
				if(mBikeStations[j].idStation === data[i].number)
				{
					mBikeStations[j].standsAvailable = data[i].available_bike_stands;
					mBikeStations[j].bikesAvailable = data[i].available_bikes;
					mBikeStations[j].date = new Date();
					mBikeStations[j].save();
					console.log(mBikeStations[j].idStation+' SAUVEGARDE !!!!!');
				}
			}
		}
	});
};	

exports.registerCronJob = function(serviceAddress, resultTreatment, cronMinutesInterval)
{  
	var cron = schedule.scheduleJob(cronMinutesInterval+' * * * *', function(){
		var xmlHttp = new XmlHttpRequest();	
		xmlHttp.open( 'GET', serviceAddress, false );
		xmlHttp.send();
		var data = JSON.parse(xmlHttp.responseText);
		var result = resultTreatment(data);
		});
};

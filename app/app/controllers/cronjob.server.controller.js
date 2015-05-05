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

	var currentDate = new Date();
	var nbInsert = 0;
	var nbUpdate = 0;
	var nbNotModified = 0;
	var nbRemoved = 0;

	var mBikeStations = [];
	BikeStation.find({ 'idStation' : {$in:velovStationID}}, function(err, bikeStations)
	{
		mBikeStations = bikeStations;
		for(var i = 0; i<data.length; i++){			
			for(var j=0; j<mBikeStations.length; j++)
			{
				if(mBikeStations[j].idStation === data[i].number)
				{
					mBikeStations[j].standsAvailable = data[i].available_bike_stands;
					mBikeStations[j].bikesAvailable = data[i].available_bikes;
					mBikeStations[j].date = new Date();
					mBikeStations[j].save();
					nbUpdate++;
				}
			}
		}
		console.log('--- Velov Update finished ---');
		var diff = new Date().getTime() - currentDate.getTime();
		console.log('\tJob done in '+diff+'ms, '+currentDate);
		console.log('\t' + nbUpdate + ' update');
		console.log('\t' + nbInsert + ' insert');
		console.log('\t' + nbNotModified + ' not modified');
		console.log('\t' + nbRemoved + ' removed');	
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
	if(modeNum !== 3){
		return;
	}
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

exports.registerTCLCronJob = function(cronMinutesInterval){
	schedule.scheduleJob(cronMinutesInterval+' * * * *', function(){
		calculateTravelTime(3, true);
	});
};


'use strict';

var mongoose = require('mongoose'),
	XmlHttpRequest = require('xmlhttprequest').XMLHttpRequest;

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
	 var ZoneDescription = mongoose.model('ZoneDescription');
	 var TravelTime = mongoose.model('TravelTime');
	 var mapKey = {};
			console.log('START '+mode);	
	  ZoneDescription.find({}).populate('adjacentZones').exec(function (err, zonesDesc) {
     	for(var i=0; i<zonesDesc.length;i++)
		{
			mapKey[zonesDesc[i]._id] = {};
			console.log('LONGUEUR '+zonesDesc[i].adjacentZones.length);
			for(var j=0;j<zonesDesc[i].adjacentZones.length;j++)
			{
					console.log('ZONE ADJACENTE A ' + zonesDesc[i].name);
					mapKey[zonesDesc[i]._id][zonesDesc[i].adjacentZones[j]._id] = '';
					var t_time = travelTime(zonesDesc[i].y,zonesDesc[i].x,zonesDesc[i].adjacentZones[j].y,zonesDesc[i].adjacentZones[j].x,mode);
					console.log('Trajet entre '+ zonesDesc[i].name +' et ' + zonesDesc[i].adjacentZones[j].name +' est de ' + t_time/60 + ' minutes');
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
		console.log('FINISH '+mode);	
     });
}

calculAllTravelTimes('walking');
calculAllTravelTimes('bicycling');

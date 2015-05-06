#!/bin/bash
#Should have grunt running

#ps -el | grep -E 'grunt|server.js'
pgrep -f 'grunt|server.js'

if test $? = 0
then
	curl http://127.0.0.1:3000/services/api/cleanAll
	mongo < removeMongoDB.cmd
	mongoimport -d pldapp-dev -c zonedescriptions < map_lyon_20150506_1716.json
	mongoimport -d pldapp-dev -c traveltimes < travel_times.json
	curl http://127.0.0.1:3000/services/firstuse
else
	echo "Grunt n'est pas lancé"
fi

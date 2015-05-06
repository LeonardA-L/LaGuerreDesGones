#Should have grunt running

ps -el | grep "grunt"

if test $? = 0
then
	mongo < removeMongoDB.cmd
	mongoimport -d pldapp-dev -c zonedescriptions < last_map_export.json
	mongoimport -d pldapp-dev -c traveltimes < travel_times.json
	curl http://127.0.0.1:3000/services/firstuse
else
	echo "Grunt n'est pas lancé"
fi

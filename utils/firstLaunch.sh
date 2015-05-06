#Should have grunt running

mongo < removeMongoDB.cmd
mongoimport -d pldapp-dev -c zonedescriptions < map_lyon_20150505_1836.json
mongoimport -d pldapp-dev -c traveltimes < travel_times.json
curl http://127.0.0.1:3000/services/firstuse

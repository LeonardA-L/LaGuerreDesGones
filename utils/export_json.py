#!/usr/bin/env python

import xml.etree.ElementTree as ET
import json
import os
from bson.objectid import ObjectId



####
# CONST
####
map_type = {}
map_type[1] = "neutral"
map_type[2] = "hospital"
map_type[3] = "park"
map_type[4] = "church"
map_type[5] = "university"
map_type[6] = "city_hall"
map_type[7] = "square"
map_type[8] = "bank"
map_type[9] = "airport"
map_type[10] = "shopping_centre"
map_type[11] = "woodstock"
map_type[12] = "station"
namespace = {'ns': 'http://www.opengis.net/kml/2.2'}

####
# VAR
####
listeZone = [];

####
# PROG
####
print("--- Lecture du fichier ---")
mapTree = ET.parse('map_lyon_20150501_1231.kml')
rootTree = mapTree.getroot()

os.remove("map_lyon_20150501_1231.json")

print("--- Parcours de l'arborescence ---")
allzones=rootTree.findall(".//ns:Placemark", namespace)

for zoneElt in allzones:
	zone = {}
	try:
		coord_elt = zoneElt.find("ns:Polygon/ns:outerBoundaryIs/ns:LinearRing/ns:coordinates", namespace)
		if coord_elt == None:	# Case of icon / pin
			continue
		coord_text = coord_elt.text
		coord_split = coord_text.split()
		coord_list = []
		for coord in coord_split:
			coord_unit = coord.split(',')
			coord_list.append([float(coord_unit[0]), float(coord_unit[1])])
		name_text = zoneElt.find("ns:name", namespace).text
		name_split = name_text.split(';') # ['16', 'Confluence', '2007', '10']

		zone["border"] = coord_list
		if name_split[2] == "":
			zone["velov"] = -1
		else:
			zone["velov"] = int(name_split[2])
		zone["type"] = map_type[int(name_split[3])]
		zone["name"] = name_split[1]
		zone["_id"] = {}
		zone["_id"]["$oid"] = str(ObjectId())
		zone["__v"] = 0
	except ValueError:
		continue
	listeZone.append(zone)

print("--- Calcul des centres ---")
for zone in listeZone:
	lat = 0
	lon = 0
	length = len(zone["border"])
	for coord in zone["border"]:
		lat = lat + coord[1]
		lon = lon + coord[0]
	lat = lat / length
	lon = lon / length
	zone["y"] = lat
	zone["x"] = lon
	

print("--- Export en Json ---")
with open('map_lyon_20150501_1231.json', 'a') as outfile:
	for zone in listeZone:
		json.dump(zone, outfile)
		outfile.write('\n')

print("--- Termine ---")





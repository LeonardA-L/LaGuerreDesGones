#!/usr/bin/env python

import xml.etree.ElementTree as ET
import json
import os
from bson.objectid import ObjectId
import urllib
import urllib2


kml_file = "map_lyon_20150503_2239.kml"
json_file = "map_lyon_20150503_2239.json"

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
headers = { 'User-Agent' : 'TCL Android (API 8+)' }
data_request = urllib.urlencode({})

####
# VAR
####
listeZone = [];

####
# PROG
####
print("--- Lecture du fichier ---")
mapTree = ET.parse(kml_file)
rootTree = mapTree.getroot()

if os.access(json_file, os.R_OK):
	os.remove(json_file)

allzones=rootTree.findall(".//ns:Placemark", namespace)
print("\t"+str(len(allzones))+" Placemark trouvees")

print("--- Generation des HashId ---")
zoneIdToHash = {}
for num in range(1,len(allzones)):
	zoneIdToHash[num] = str(ObjectId())
i = 0
print("--- Parcours de l'arborescence ---")
for zoneElt in allzones:
	zone = {}
	try:
		coord_elt = zoneElt.find("ns:Polygon/ns:outerBoundaryIs/ns:LinearRing/ns:coordinates", namespace)
		if coord_elt == None:	# Case of icon / pin
			continue
		i = i +1
		coord_text = coord_elt.text
		name_text = zoneElt.find("ns:name", namespace).text
		desc_text = zoneElt.find("ns:description", namespace).text
		coord_split = coord_text.split()
		coord_list = []
		for coord in coord_split:
			coord_unit = coord.split(',')
			coord_list.append([float(coord_unit[0]), float(coord_unit[1])])

		name_split = name_text.split(';') # ['16', 'Confluence', '2007', '10']
		desc_split = desc_text.split(';') # ['1', '20']

		zone["adjacentZones"] = []
		for adjId in desc_split:
			zone["adjacentZones"].append(zoneIdToHash[int(adjId)])

		zone["border"] = coord_list
		if name_split[2] == "":
			zone["velov"] = -1
		else:
			zone["velov"] = int(name_split[2])
		zone["type"] = map_type[int(name_split[3])]
		zone["name"] = name_split[1]
		zone["_id"] = {}
		zone["_id"]["$oid"] = zoneIdToHash[int(name_split[0])]
		zone["__v"] = 0
	except ValueError:
		print("\tElement "+ str(i) +" a leve une exception | Content : "+name_text)
		continue
	listeZone.append(zone)

print("\t"+str(len(listeZone))+"/"+str(i)+" zones traitees")

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

print("--- Requete des infos TCL ---")
for zone in listeZone:
	url = "http://app.tcl.fr/mob_app/appli_mobile/getitindeparr/android/"+ str(zone["y"]) + "/" + str(zone["x"]) +"///" + str(zone["y"]) + "/" + str(zone["x"]) +"///"
	req = urllib2.Request(url, data_request, headers)
	response = urllib2.urlopen(req)
	content =  response.read()
	jsonElt = json.loads(content)
	zone["tclID"] = jsonElt['DATA']['Depart'][0]['value']

print("--- Check content ---")
for zone in listeZone:
	if len(zone["type"]) <= 0 :
		print(zone["name"] + " ne possede pas un nom bien forme")
	if len(zone["_id"]["$oid"]) <= 0 :
		print(zone["name"] + " ne possede pas un id bien forme")
	if len(zone["adjacentZones"]) <= 0 :
		print(zone["name"] + " ne possede pas de zones adjacentes")
	if len(zone["border"]) <= 0 :
		print(zone["name"] + " ne possede pas de frontieres")
	if len(zone["tclID"]) <= 0 :
		print(zone["name"] + " ne possede pas d'ID TCL correct")

print("--- Export en Json ---")
with open(json_file, 'a') as outfile:
	for zone in listeZone:
		json.dump(zone, outfile)
		outfile.write('\n')

print("--- Termine ---")





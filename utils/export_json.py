#!/usr/bin/env python
# -*- coding: utf-8 -*-

import xml.etree.ElementTree as ET

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
namespace = "http://www.opengis.net/kml/2.2"

####
# PROG
####
print("Lecture du fichier")
mapTree = ET.parse('map_lyon_20150501_1043.kml')
rootTree = mapTree.getroot()
mapObj = [];

domain = rootTree.attrib
print(domain)

print("Parcours de l'arborescence")
i = 0
allzones=rootTree.findall("./{"+namespace+"}Document/{"+namespace+"}Folder/{"+namespace+"}Placemark")

for zone in allzones:
	print("Zone "+str(i)+" :")
	if zone.find("{"+namespace+"}Point") == None:
		pass
	zone_text = zone.find("{"+namespace+"}name").text
	print (zone_text)
	i=i+1

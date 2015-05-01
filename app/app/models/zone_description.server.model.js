'use strict';

/**
 * Const
 */
var NEUTRAL = 'neutral';
var HOSPITAL = 'hospital';
var PARK = 'park';
var UNIVERSITY = 'university';
var CHURCH = 'church';
var WOODSTOCK = 'woodstock';
var STATION = 'station';
var AIRPORT = 'airport';
var CITY_HALL = 'city_hall';
var SQUARE = 'square';
var BANK = 'bank';
var SHOPPING_CENTRE = 'shopping_centre';


/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Zone Schema
 */

var ZoneDescriptionSchema = new Schema({
	type: {
		type: String,
		enum: [NEUTRAL, HOSPITAL, PARK, UNIVERSITY, CHURCH, WOODSTOCK, STATION, AIRPORT, CITY_HALL, SQUARE, BANK, SHOPPING_CENTRE],
		default: NEUTRAL
	},
	name: {
		type: String,
		trim: true,
		default: ''
	},
	border: [{
		type: Schema.Types.ObjectId,
		ref: 'PointGeo'
	}],
	center:{
		type: Schema.Types.ObjectId,
		ref: 'PointGeo'
	}
});

mongoose.model('ZoneDescription', ZoneDescriptionSchema);

'use strict';

/**
 * Const
 */
var DRIVING = 0;
var BICYCLING = 1;
var WALKING = 2;
var PUBLIC_TRANSPORT = 3;


/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Zone Schema
 */

var TravelTimeSchema = new Schema({
	mode: {
		type: Number,
		enum: [DRIVING, BICYCLING, WALKING, PUBLIC_TRANSPORT],
		required : true
	},

	time : {
		type: Number,
		required: true
	},

	departureZone : {
		type: Schema.Types.ObjectId,
		required: true
	},

	arrivalZone : {
		type: Schema.Types.ObjectId,
		required: true
	},
	
	date : {
		type: Date,
		required: true
	}

});

mongoose.model('TravelTime', TravelTimeSchema);

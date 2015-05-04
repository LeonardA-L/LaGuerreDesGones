'use strict';

/**
 * Const
 */



/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Zone Schema
 */

var BikeStationSchema = new Schema({

	idStation : {
		type: Number,
		required: true
	},

	standsAvailable : {
		type: Number,
		required: true,
		default : 0
	},

	bikesAvailable : {
		type: Number,
		required: true,
		default : 0
	},


	date : {
		type: Date,
		required : true
	}

});

mongoose.model('BikeStation', BikeStationSchema);

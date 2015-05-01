'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Zone Schema
 */

var PointGeoSchema = new Schema({
	latitude: {
		type: Number,
		default: 0,
		required: true
	},
	longitude: {
		type: Number,
		default: 0,
		required: true
	}
});

mongoose.model('PointGeo', PointGeoSchema);

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Zone Schema
 */

var ZoneSchema = new Schema({
	type: {
		type: Number,
		default: 0
	},
	name: {
		type: String,
		default: ''
	},
	nbUnitMax: {
		type: Number,
		default: 0
	},
	point: {
		type: Number,
		default: 0
	},
	x: {
		type: Number,
		default: 0
	},
	y: {
		type: Number,
		default: 0
	},
	unit: [{
		type: Schema.Types.ObjectId,
		ref: 'UnitSchema'
	}],
});

mongoose.model('Zone', ZoneSchema);
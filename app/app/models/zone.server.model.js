'use strict';

/**
 * Const
 */
var DEFAULT_MAX_UNIT_NUMBER = 8;

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Zone Schema
 */

var ZoneSchema = new Schema({
	units: [{
		type: Schema.Types.ObjectId,
		ref: 'Unit'
	}],
	game:{
		type: Schema.Types.ObjectId,
		ref: 'Game'
	},
	zoneDesc:{
		type: Schema.Types.ObjectId,
		ref: 'ZoneDescription',
// TODO		required: true
	},
	nbUnitMax: {
		type: Number,
		default: DEFAULT_MAX_UNIT_NUMBER
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'Player'
	}
});

mongoose.model('Zone', ZoneSchema);

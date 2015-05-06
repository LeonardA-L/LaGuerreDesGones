'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Objective Schema
 */
var ObjectiveSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: true
	},
	description: {
		type: String,
		trim: true,
		required: true
	},
	money: {
		type: Number,
		default: 0
	},
	point: {
		type: Number,
		default: 0
	}
});

mongoose.model('Objective', ObjectiveSchema);

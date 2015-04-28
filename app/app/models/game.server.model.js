 'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

/**
 * Game Schema
 */
var GameSchema = new Schema({
	title: {
		type: String,
		trim: true,
		default: '',
	},
	nMaxPlayerUnit: {
		type: Number,
		
	},
	nMaxPlayer: {
		type: Number,
		
	},
	isInit: {
		type: Boolean,
		default: false,
	},
	startTime: {
		type: Date,
	}
});

mongoose.model('Game', GameSchema);

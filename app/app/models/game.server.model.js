 'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateMaxPlayer = function(maxPlayer) {
	return (maxPlayer >= 3 && maxPlayer <= 8);
};

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
		validate: [validateMaxPlayer, 'Please set a value between 3 & 8']
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
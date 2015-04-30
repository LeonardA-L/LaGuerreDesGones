 'use strict';

/**
 * Const
 */
var MIN_PLAYER = 3;
var MAX_PLAYER = 8;
var DELAY_TIMESTAMP = 2*60*1000;

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

/**
 * A Validation function for Player Number properties
 */
var validateMaxPlayer = function(maxPlayer) {
	return (maxPlayer >= 3 && maxPlayer <= 8);
};

/**
 * A Validation function for Date properties
 */
var validateDate = function(date) {
	return (new Date(date).getTime() >= DELAY_TIMESTAMP + Date.now());
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
		required: true
	},
	nMaxPlayer: {
		type: Number,
		required: true,
		validate: [validateMaxPlayer, 'Please set a value between 3 & 8']
	},
	isInit: {
		type: Boolean,
		default: false,
	},
	startTime: {
		type: Date,
		validate: [validateDate, 'The Start Day must be delayed']
	},
	zone: [{
		type: Schema.Types.ObjectId,
		ref: 'Zone'
	}]
});

mongoose.model('Game', GameSchema);

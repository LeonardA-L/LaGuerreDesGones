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
	return (maxPlayer >= 2 && maxPlayer <= 8);
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
	nMinPlayer: {
		type: Number,
		validate: [validateMaxPlayer, 'Please set a value between 2 & 8']
	},
	nMaxPlayer: {
		type: Number,
		required: true,
		validate: [validateMaxPlayer, 'Please set a value between 2 & 8']
	},
	isInit: {
		type: Boolean,
		default: false,
	},
	startTime: {
		type: Date
	},
	zones: [{
		type: Schema.Types.ObjectId,
		ref: 'Zone'
	}],
	players: [{
		type: Schema.Types.ObjectId,
		ref: 'Player'
	}],
	creator:{
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	winner:{
		type: Schema.Types.ObjectId,
		ref: 'Player'
	}
});


mongoose.model('Game', GameSchema);
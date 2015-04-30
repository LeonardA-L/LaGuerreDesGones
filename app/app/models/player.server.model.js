'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Player Schema
 */
var PlayerSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: true
	},
	dateCreated: {
		type: Date,
		default: Date.now
	},
	isAdmin:{
		type: Boolean,
		default: false
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	game: {
		type: Schema.Types.ObjectId,
		ref: 'Game'
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

mongoose.model('Player', PlayerSchema);

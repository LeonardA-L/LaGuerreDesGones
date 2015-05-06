'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Zone Schema
 */

var ChatMessageSchema = new Schema({
	game: {
		type: Schema.Types.ObjectId,
		ref: 'Game'
	},
	player:{
		type: Schema.Types.ObjectId,
		ref: 'Player'
	},

	message: String,

	date: Date,

});

mongoose.model('ChatMessage', ChatMessageSchema);

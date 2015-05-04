'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * ScoreBoard Schema
 */
var ScoreBoardSchema = new Schema({
	player: {
		type: Schema.Types.ObjectId,
		ref: 'Player'
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
	},
	kills: [{
		type: Schema.Types.ObjectId,
		ref: 'Unit'
	}],
	survivors: [{
		type: Schema.Types.ObjectId,
		ref: 'Unit'
	}],
	objectives: [{
		type: Schema.Types.ObjectId,
		ref: "Objective"
	}],
	zones: [{
		type: Schema.Types.ObjectId,
		ref: "Zone"
	}]
});

mongoose.model('ScoreBoard', ScoreBoardSchema);

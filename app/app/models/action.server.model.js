 'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

	//mongoose.set('debug', true);
/**
 * Action Schema
 */
var ActionSchema = new Schema({

	type :{
		type: Number,
		default: 0
	},
	date:{
		type:Date
	},
	status :{
		type: Number,
		default: 0
	},
	gameId :{
		type: String
	},
	
	// For Displacement
	zoneA:{
		type: Schema.Types.ObjectId,
		ref: 'ZoneSchema'
	},
	zoneB:{
		type: Schema.Types.ObjectId,
		ref: 'ZoneSchema'
	},
	units:[{
		type: Schema.Types.ObjectId,
		ref: 'UnitSchema'
	}],
	// For battle
	zone:{
		type: Schema.Types.ObjectId,
		ref: 'ZoneSchema'
	},
	
	// For init
	
	game:{
		type: Schema.Types.ObjectId,
		ref: 'GameSchema'
	}
	
});

mongoose.model('Action', ActionSchema);

exports.ActionSchema = ActionSchema;

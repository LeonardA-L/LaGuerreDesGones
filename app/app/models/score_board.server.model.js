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
		ref: 'Objective'
	}],
	zones: [{
		type: Schema.Types.ObjectId,
		ref: 'Zone'
	}]
});

/**
 * Calculate total player points 
 */
ScoreBoardSchema.methods.calculatePoints= function(){
	var Unit = Schema.model('Unit');
	var Zone = Schema.model('Zone');
	var Objective = Schema.model('Objective');
	this.point = 0;
	var i;
	var doc;
	for (i=0;i<this.objectives.length; i++){
		doc = Objective.findById(this.objectives[i]);
		this.point +=doc.point; 
	}
	for (i=0; i<this.zones.length; i++){
		doc = Zone.findById(this.zones[i]);
		this.point +=doc.point;
	}
	for (i=0; i<this.survivors.length; i++){
		doc =Unit.findById(this.survivors[i]);
				this.point +=doc.point;
	}
	for (i=0; i<this.kills.length; i++){
		doc = Unit.findById(this.kills[i]);
		this.point +=doc.point;
	}
};

/**
 * Get the number of kills by unit type 
 */
 ScoreBoardSchema.methods.getKillsByUnitType = function(type){
	var Unit = Schema.model('Unit');
	var nb = 0;
	for (var i=0; i<this.kills.length; i++){
		var doc = Unit.findById(this.kills[i]);
		if (doc.type === type)
			nb++;
	}
	return nb;
 };

 /**
 * Get the number of survivors by unit type 
 */
 ScoreBoardSchema.methods.getSurvivorsByUnitType = function(type){
	var Unit = Schema.model('Unit');
	var nb = 0;
	for (var i=0; i<this.survivors.length; i++){
		var doc = Unit.findById(this.survivors[i]);
		if (doc.type === type)
			nb++;
	}
	return nb;
 };

 /**
 * Get the number of proprietary zones by zone type 
 */
 ScoreBoardSchema.methods.getZonesByUnitType = function(type){
	var Zone = Schema.model('Zone');
	var nb = 0;
	for (var i=0; i<this.zones.length; i++){
		var doc = Zone.findById(this.zones[i]).populate('zoneDesc');
		if (doc.zoneDesc.type === type)
			nb++;
	}
	return nb;
 };

mongoose.model('ScoreBoard', ScoreBoardSchema);

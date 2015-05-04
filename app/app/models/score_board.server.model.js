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

/**
 * Calculate total player points 
 */
ScoreBoard.methods.calculatePoints= function(){
	var Unit = Schema.model('Unit');
	var Zone = Schema.model('Zone');
	var Objective = Schema.model('Objective');
	this.point = 0;
	for (var i=0; i<this.objectives.length; i++){
		Objective.findById(this.objectives[i],function(err,doc){
				this.point +=doc.point;
		}); 
	}
	for (var i=0; i<this.zones.length; i++){
		Zone.findById(this.zones[i],function(err,doc){
				this.point +=doc.point;
		});
	}
	for (var i=0; i<this.survivors.length; i++){
		Unit.findById(this.survivors[i],function(err,doc){
				this.point +=doc.point;
		});
	}
	for (var i=0; i<this.kills.length; i++){
		Unit.findById(this.kills[i],function(err,doc){
				this.point +=doc.point;
		});
	}
};

/**
 * Get the number of kills by unit type 
 */
 ScoreBoard.methods.getKillsByUnitType = function(type){
	var Unit = Schema.model('Unit');
	var nb = 0;
	for (var i=0; i<this.kills.length; i++){
		Unit.findById(this.kills[i], function(err,doc){
			if (doc.type === type)
				nb++;
		});
	}
	return nb;
 }

 /**
 * Get the number of survivors by unit type 
 */
 ScoreBoard.methods.getSurvivorsByUnitType = function(type){
	var Unit = Schema.model('Unit');
	var nb = 0;
	for (var i=0; i<this.survivors.length; i++){
		Unit.findById(this.survivors[i], function(err,doc){
			if (doc.type === type)
				nb++;
		});
	}
	return nb;
 }

 /**
 * Get the number of proprietary zones by zone type 
 */
 ScoreBoard.methods.getZonesByUnitType = function(type){
	var Zone = Schema.model('Zone');
	var nb = 0;
	for (var i=0; i<this.zones.length; i++){
		Zone.findById(this.zones[i]).populate('zoneDesc').exec(function(err,doc){
			if (doc.zoneDesc.type === type)
				nb++;
		});
	}
	return nb;
 }

mongoose.model('ScoreBoard', ScoreBoardSchema);

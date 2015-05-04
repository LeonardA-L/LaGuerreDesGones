 'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto'),
	http = require('http');

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
	
	// For Displacement
	zoneA:{
		type: Schema.Types.ObjectId,
		ref: 'Zone'
	},
	zoneB:{
		type: Schema.Types.ObjectId,
		ref: 'Zone'
	},
	units:[{
		type: Schema.Types.ObjectId,
		ref: 'Unit'
	}],
	// For battle
	zone:{
		type: Schema.Types.ObjectId,
		ref: 'Zone'
	},
	
	// For init
	game:{
		type: Schema.Types.ObjectId,
		ref: 'Game'
	},
	player: {
		type: Schema.Types.ObjectId,
		ref: 'Player'
	},
	newUnitType : Number
	
});

ActionSchema.post('save', function () {

  //console.log('Post save hook');
  if(this.status === 0){
  	//console.log('New Action');
  	var http = require('http');
	var options = {
	  host: 'localhost',
	  path: '/',
	  port: '7878',
	  method: 'GET'
	};
	
	var req = http.request(options);
	req.on('error', function(error) {
  		console.log('No main beowulf worker');
	});
	req.end();

  }
  return true;
});

mongoose.model('Action', ActionSchema);

exports.ActionSchema = ActionSchema;

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Unit Schema
 */

var MatrixSchema = new Schema({
	name : String,
	content: Schema.Types.Mixed
});

mongoose.model('Matrix', MatrixSchema);
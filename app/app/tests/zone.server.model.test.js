'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	Unit = mongoose.model('Unit'),
	Zone = mongoose.model('Zone'),
	ZoneDesc = mongoose.model('ZoneDescription');

/**
 * Globals
 */
var unit1, unit2;
var zone1, zone2;

/**
 * Unit tests
 */
describe('Zone Model Unit Tests:', function() {
	before(function(done) {
		zone1 = new Zone({
			point: 5,
			//unit: 'local',
			//zoneDesc: ......
		});
/*
		unit1 = new Unit({
			type: 1,
			zone: 'test@test.com',
			attack: 10,
			defence: 5,
			health: 'local',
			//point: 50
		});
*/
		done();
	});

	describe('Method Save', function() {
		it('should begin with no zone', function(done) {
			Zone.find({}, function(err, zones) {
				zones.should.have.length(0);
				done();
			});
		});
	});

	after(function(done) {
		Zone.remove().exec();
		done();
	});
});

'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	ZoneDescription = mongoose.model('ZoneDescription'),
	PointGeo = mongoose.model('PointGeo');

/**
 * Globals
 */
var zoneDesc1, zoneDesc2;

/**
 * Unit tests
 */
describe('Zone Model Unit Tests:', function() {
	before(function(done) {
		zoneDesc1 = new ZoneDescription({
			name: 'Salle 208',
			//unit: 'local',
		});
		done();
	});

	describe('Method Save', function() {
		it('should begin with no zone description', function(done) {
			ZoneDescription.find({}, function(err, zonesDesc) {
				zonesDesc.should.have.length(0);
				done();
			});
		});
		it('should be able to save without problems', function(done) {
			zoneDesc1.save();
			done();
		});
	});

	after(function(done) {
		ZoneDescription.remove().exec();
		done();
	});
});

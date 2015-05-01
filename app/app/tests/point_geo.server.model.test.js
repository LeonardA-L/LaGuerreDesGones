'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	PointGeo = mongoose.model('PointGeo');

/**
 * Globals
 */
var point1, point2;

/**
 * Unit tests
 */
describe('Zone Model Unit Tests:', function() {
	before(function(done) {
		point1 = new PointGeo({
			latitude: 10.5,
			longitude: 11.5,
		});
		done();
	});

	describe('Method Save', function() {
		it('should begin with no point', function(done) {
			PointGeo.find({}, function(err, points) {
				points.should.have.length(0);
				done();
			});
		});
		it('should be able to save without problems', function(done) {
			point1.save();
			done();
		});
	});

	after(function(done) {
		PointGeo.remove().exec();
		done();
	});
});

'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	Game = mongoose.model('Game');

/**
 * Globals
 */
var game1, game2, game3, game4;

/**
 * Unit tests
 */
describe('Game Model Unit Tests:', function() {
	before(function(done) {
		game1 = new Game({
			title: 'Fucking Game',
			nMaxPlayerUnit: 8,
			nMaxPlayer: 8,
			startTime: new Date(1430236800)
		});
		game2 = new Game({
			title: 'Fucking Game',
			nMaxPlayerUnit: 8,
			nMaxPlayer: 9,
			startTime: new Date(1430236800)
		});
		game3 = new Game({
			title: 'Fucking Game',
			nMaxPlayerUnit: 8,
			nMaxPlayer: 2,
			startTime: new Date(1430236800)
		});
		game4 = new Game({
			title: 'Fucking Game',
			nMaxPlayerUnit: 8,
			nMaxPlayer: 4,
			startTime: new Date(1430236800)
		});
		done();
	});

	describe('Method Save', function() {
		it('should begin with no users', function(done) {
			Game.find({}, function(err, games) {
				games.should.have.length(0);
				done();
			});
		});

		it('should be able to save without problems', function(done) {
			game1.save(done);
		});

		it('should fail because of nMaxPlayer too high', function(done) {
			return game2.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should fail because of nMaxPlayer too low', function(done) {
			return game3.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to save with 2 different ids', function(done) {
			game1.save();
			game4.save();
			game1.should.have.property('_id');
			game4.should.have.property('_id');
			should(game1._id != game4._id);
			done();
		});
	});

	after(function(done) {
		Game.remove().exec();
		done();
	});
});

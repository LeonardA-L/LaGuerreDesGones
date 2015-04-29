'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	Player = mongoose.model('Player'),
	User = mongoose.model('User'),
	Game = mongoose.model('Game');

/**
 * Globals
 */
var player1, player2, player3, user1, user2, game1;

/**
 * Unit tests
 */
describe('Player Model Unit Tests:', function() {
	before(function(done) {
		user1 = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password',
			provider: 'local'
		});
		user2 = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password',
			provider: 'local'
		});
		user1.save();
		user2.save();
		game1 = new Game({
			title: 'Fucking Game',
			nMaxPlayerUnit: 8,
			nMaxPlayer: 8,
			startTime: new Date(1430236800)
		});
		game1.save();
		player1 = new Player(name: 'titi', user: user1._id, game: game1._id);
		player2 = new Player(name: 'titi', user: user2._id, game: game1._id);
		done();
	});

	describe('Method Save', function() {
		it('should begin with no players', function(done) {
			Player.find({}, function(err, players) {
				players.should.have.length(0);
				done();
			});
		});
		it('should be able to save without problems', function(done) {
			player1.save(done);
		});

		it('should be able to save with 2 different name', function(done) {
			player1.save();
			player2.save();
			should(player1.name != player2.name);
			done();
		});
	});

	after(function(done) {
		Player.remove().exec();

		done();
	});
});

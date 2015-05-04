'use strict';

module.exports = {
	dbname: 'pldapp-dev',
	pollingInterval:6,
	defaultPort:27017,
	defaultHost:'localhost',
	autoWakeupInterval:10000,
	callback:'services/play/callback',
	defaultCallbackPort:3000,
	debug:true

};

'use strict';

module.exports = {
	dbname: 'pldapp-dev',
	pollingInterval:4,
	defaultPort:27017,
	defaultHost:'localhost',
	autoWakeupInterval:20000,
	callback:'services/play/callback',
	defaultCallbackPort:3000,
	debug:true
};

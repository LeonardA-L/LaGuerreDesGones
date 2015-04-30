'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');

angular.module('users').constant('UserConst', 
	{
		authorisation: {
			authorised: 0,
			loginRequired: 1,
			notAuthorised: 2
		},
		permissionType: {
			atLeastOne: 0,
			combinationRequired: 1
		}
	});


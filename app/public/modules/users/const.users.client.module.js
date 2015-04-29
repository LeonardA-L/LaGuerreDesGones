'use strict';

angular.module('users').constant('authorisationConst', 
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


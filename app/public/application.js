'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);



// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName)
	.config(['$locationProvider',
		function($locationProvider) {
			$locationProvider.hashPrefix('!');
		}
	]);

// Setting Authorisation Redirection
angular.module(ApplicationConfiguration.applicationModuleName)
	.run(['$rootScope', '$location', 'Authorisation', 'UserConst',
		function ($rootScope, $location, Authorisation, UserConst) {
			$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
				var authorised;
				if (toState.access !== undefined) {
					authorised = Authorisation.authorise(toState.access.loginRequired, toState.access.permissions, toState.access.permissionCheckType);
					if (authorised === UserConst.authorisation.loginRequired) {
						$location.path('signin').replace();
					} else if (authorised === UserConst.authorisation.notAuthorised) {
						$location.path('').replace();
					}
				}
			});
	}]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

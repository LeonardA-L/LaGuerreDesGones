'use strict';

angular.module('users').factory('Authorisation', ['Authentication', 'UserConst',
	function (Authentication, UserConst) {
		var authorise = function (loginRequired, requiredPermissions, permissionCheckType) {
			var result = UserConst.authorisation.authorised,
				user = Authentication.user,
				loweredPermissions = [],
				hasPermission = true,
				permission, i;

			permissionCheckType = permissionCheckType || UserConst.permissionType.atLeastOne;
			
			if (loginRequired === true && user === '') {
			// Login required and not connected
				result = UserConst.authorisation.loginRequired;
			} else if ((loginRequired === true && user !== '') && (requiredPermissions === undefined || requiredPermissions.length === 0)) {
			// Login required, connected but no specific permissions are specified.
				result = UserConst.authorisation.authorised;
			} else if (requiredPermissions) {
				// Login required, connected and specific permissions are specified.
				loweredPermissions = [];
				angular.forEach(user.permissions, function (permission) {
					loweredPermissions.push(permission.toLowerCase());
				});
				for (i = 0; i < requiredPermissions.length; i += 1) {
					permission = requiredPermissions[i].toLowerCase();
					if (permissionCheckType === UserConst.permissionType.combinationRequired) {
						hasPermission = hasPermission && loweredPermissions.indexOf(permission) > -1;
						// if all the permissions are required and hasPermission is false there is no point carrying on
						if (hasPermission === false) {
						    break;
						}
					} else if (permissionCheckType === UserConst.permissionType.atLeastOne) {
						hasPermission = loweredPermissions.indexOf(permission) > -1;
						// if we only need one of the permissions and we have it there is no point carrying on
						if (hasPermission) {
						    break;
						}
					}
				}
				result = hasPermission ? UserConst.authorisation.authorised : UserConst.authorisation.notAuthorised;
			}
			return result;
		};

	    return {
	    	authorise: authorise
	    };
}
]);


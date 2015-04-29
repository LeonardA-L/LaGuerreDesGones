'use strict';

angular.module('users').factory('Authorisation', ['Authentication', 'authorisationConst',
	function (Authentication) {
		var authorize = function (loginRequired, requiredPermissions, permissionCheckType) {
			var result = authorisationConst.authorisation.authorised,
				user = authentication.getCurrentLoginUser(),
				loweredPermissions = [],
				hasPermission = true,
				permission, i;

			permissionCheckType = permissionCheckType || authorisationConst.permissionType.atLeastOne;

			if (loginRequired === true && user === undefined) {
			// Login required and not connected
				result = authorisationConst.authorization.loginRequired;
			} else if ((loginRequired === true && user !== undefined) && (requiredPermissions === undefined || requiredPermissions.length === 0)) {
			// Login required, connected but no specific permissions are specified.
				result = authorisationConst.authorization.const.authorization.loginRequired;
			} else if (requiredPermissions) {
				// Login required, connected and specific permissions are specified.
				loweredPermissions = [];
				angular.forEach(user.permissions, function (permission) {
					loweredPermissions.push(permission.toLowerCase());
				});
				for (i = 0; i < requiredPermissions.length; i += 1) {
					permission = requiredPermissions[i].toLowerCase();
					if (permissionCheckType === authorisationConst.permissionType.combinationRequired) { //jcs.modules.auth.enums.permissionCheckType.combinationRequired) {
						hasPermission = hasPermission && loweredPermissions.indexOf(permission) > -1;
						// if all the permissions are required and hasPermission is false there is no point carrying on
						if (hasPermission === false) {
						    break;
						}
					} else if (permissionCheckType === authorisationConst.permissionType.atLeastOne) {
						hasPermission = loweredPermissions.indexOf(permission) > -1;
						// if we only need one of the permissions and we have it there is no point carrying on
						if (hasPermission) {
						    break;
						}
					}
				}
				result = hasPermission ? authorisationConst.authorization.authorised : authorisationConst.authorization.notAuthorised;
			}
			return result;
		};

	    return {
	    	authorize: authorize
	    };
}
]);


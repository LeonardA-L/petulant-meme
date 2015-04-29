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

// Setting Authorization Redirection
angular.module(ApplicationConfiguration.applicationModuleName)
	.run(['$rootScope', '$location', 'Authorization', 'authorisationConst',
		function ($rootScope, $location, authorization) {
			var routeChangeRequiredAfterLogin = false,
				loginRedirectUrl;
			$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
				var authorised;
				if (routeChangeRequiredAfterLogin && next.originalPath !== 'signin') {
					routeChangeRequiredAfterLogin = false;
					$location.path(loginRedirectUrl).replace();
				} else if (toState.access !== undefined) {
					authorised = authorization.authorize(toState.access.loginRequired, toState.access.permissions, toState.access.permissionCheckType);
					if (authorised === authorisationConst.authorization.loginRequired) {
						routeChangeRequiredAfterLogin = true;
						loginRedirectUrl = toState.originalPath;
						$location.path('signin');
					} else if (authorised === authorisationConst.authorization.notAuthorised) {
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

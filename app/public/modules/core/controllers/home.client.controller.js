'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

			$( document ).ready(function() {
    	$('#home-main').css({'height':(($(window).height())-$('header').height())+'px'});	
		$(window).resize(function() {
			$('#home-main').css({'height':(($(window).height())-$('header').height())+'px'});
		});
	});

				window.scrollTo(0,0);
		$('body').css('overflow-y','hidden');

		$scope.$on('$destroy', function(){
        	$('body').css('overflow-y','auto');
    	});
	}
]);
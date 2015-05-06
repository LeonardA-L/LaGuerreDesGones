'use strict';

angular.module('play')
	.directive('accordion', function ($rootScope) {
		return {
			priority: 10,
	 		link: function(scope, element, attr) {
				var resizeFct = function(){
					var tabsHeight = $('.panel-heading').outerHeight() * $('.panel-heading').length;
					var height = $('#game-wrap-panels').innerHeight() - tabsHeight;
					var body = $('.panel-body');
					body.css({'height':(height - 1)+'px'});
				}
				$(window).resize(resizeFct);
				resizeFct();
		    }
		};
	});

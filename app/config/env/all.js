'use strict';

module.exports = {
	app: {
		title: 'pldApp',
		description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
		keywords: 'MongoDB, Express, AngularJS, Node.js'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/lib/angular-material/angular-material.css',
				'public/lib/fontawesome/css/font-awesome.min.css'

			],
			js: [
				'public/lib/jquery/dist/jquery.js',
				'public/lib/jquery-ui/jquery-ui.min.js',
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/angular-dragdrop/src/angular-dragdrop.js',
				'public/lib/angular-animate/angular-animate.min.js',
				'public/lib/angular-aria/angular-aria.min.js',
				'public/lib/angular-material/angular-material.js',
				'public/lib/angular-socket-io/socket.js'
			]
		},
		css: [
			//'public/modules/**/css/*.css'
			'public/css/style.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};

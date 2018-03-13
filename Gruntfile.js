/*global module:false*/
module.exports = function( grunt ) {

	"use strict";

	// Project configuration.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( "package.json" ),
		files: [
			"src/intro.js",
			"src/version.js",
			"src/migrate.js",
			"src/core.js",
			"src/ajax.js",
			"src/attributes.js",
			"src/css.js",
			"src/data.js",
			"src/effects.js",
			"src/event.js",
			"src/offset.js",
			"src/serialize.js",
			"src/traversing.js",
			"src/deferred.js",
			"src/outro.js"
		],
		tests: {
			"jquery": [
				"dev+git",
				"min+git.min",
				"dev+3.2.1",
				"dev+3.1.1",
				"dev+3.0.0"
			]
		},
		banners: {
			tiny: "/*! <%= pkg.name %> <%= pkg.version %> - <%= pkg.homepage %> */"
		},
		concat: {
			options: {
				banner: "/*!\n * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " +
					"<%= grunt.template.today('yyyy-mm-dd') %>\n" +
					" * Copyright <%= pkg.author.name %>\n */\n"
			},
			dist: {
				src: "<%= files %>",
				dest: "dist/<%= pkg.name %>.js"
			}
		},
		qunit: {
			files: [ "test/**/index.html" ]
		},
		eslint: {
			options: {

				// See https://github.com/sindresorhus/grunt-eslint/issues/119
				quiet: true
			},

			dist: {
				src: "dist/jquery-migrate.js"
			},
			dev: {
				src: [
					"Gruntfile.js",
					"build/**/*.js",
					"src/**/*.js",
					"test/**/*.js"
				]
			}
		},
		uglify: {
			all: {
				files: {
					"dist/jquery-migrate.min.js": [ "src/migratemute.js", "dist/jquery-migrate.js" ]
				}
			},
			options: {
				banner: "/*! jQuery Migrate v<%= pkg.version %>" +
					" | (c) <%= pkg.author.name %> | jquery.org/license */\n",
				beautify: {
					ascii_only: true
				}
			}
		},
		karma: {
			options: {
				customContextFile: "karma/context.html",
				customDebugFile: "karma/debug.html",
				frameworks: [ "qunit" ],
				files: [
					"https://code.jquery.com/jquery-git.min.js",
					"dist/jquery-migrate.min.js",

					"test/testinit.js",
					"test/migrate.js",
					"test/core.js",
					"test/ajax.js",
					"test/attributes.js",
					"test/css.js",
					"test/data.js",
					"test/deferred.js",
					"test/effects.js",
					"test/event.js",
					"test/offset.js",
					"test/serialize.js",
					"test/traversing.js",

					{ pattern: "dist/jquery-migrate.js", included: false, served: true },
					{ pattern: "test/**/*.@(js|css|jpg|html|xml)", included: false, served: true }
				],
				reporters: [ "dots" ],
				autoWatch: false,
				concurrency: 3,
				captureTimeout: 20 * 1000,
				singleRun: true
			},
			main: {
				browsers: [ "ChromeHeadless" ]
			},

			// To debug tests with Karma:
			// 1. Run 'grunt karma:chrome-debug' or 'grunt karma:firefox-debug'
			//    (any karma subtask that has singleRun=false)
			// 2. Press "Debug" in the opened browser window to start
			//    the tests. Unlike the other karma tasks, the debug task will
			//    keep the browser window open.
			"chrome-debug": {
				browsers: [ "Chrome" ],
				singleRun: false
			},
			"firefox-debug": {
				browsers: [ "Firefox" ],
				singleRun: false
			}
		},
		watch: {
			files: [ "src/*.js", "test/*.js" ],
			tasks: [ "build" ]
		}
	} );

	// Load grunt tasks from NPM packages
	require( "load-grunt-tasks" )( grunt );

	// Integrate jQuery migrate specific tasks
	grunt.loadTasks( "build/tasks" );

	// Just an alias
	grunt.registerTask( "test", [ "karma:main" ] );

	grunt.registerTask( "lint", [

		// Running the full eslint task without breaking it down to targets
		// would run the dist target first which would point to errors in the built
		// file, making it harder to fix them. We want to check the built file only
		// if we already know the source files pass the linter.
		"eslint:dev",
		"eslint:dist"
	] );
	grunt.registerTask( "build", [ "concat", "uglify", "lint" ] );

	grunt.registerTask( "default", [ "build", "test" ] );

	// For CI
	grunt.registerTask( "ci", [ "build", "test" ] );
};

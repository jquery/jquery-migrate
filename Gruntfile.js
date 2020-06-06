"use strict";

/* global module:false */

module.exports = function( grunt ) {

	const gzip = require( "gzip-js" );

	const karmaFilesExceptJQuery = [
		"dist/jquery-migrate.min.js",
		"test/data/compareVersions.js",

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
		"test/manipulation.js",
		"test/offset.js",
		"test/serialize.js",
		"test/traversing.js",

		{ pattern: "dist/jquery-migrate.js", included: false, served: true },
		{ pattern: "test/**/*.@(js|css|jpg|html|xml)", included: false, served: true }
	];

	// Project configuration.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( "package.json" ),
		compare_size: {
			files: [ "dist/jquery-migrate.js", "dist/jquery-migrate.min.js" ],
			options: {
				compress: {
					gz: function( contents ) {
						return gzip.zip( contents, {} ).length;
					}
				},
				cache: "build/.sizecache.json"
			}
		},
		tests: {
			jquery: [
				"dev+git",
				"min+git.min",
				"dev+git.slim",
				"min+git.slim.min"
			],
			"jquery-3": [
				"dev+3.x-git",
				"min+3.x-git.min",
				"dev+3.x-git.slim",
				"min+3.x-git.slim.min",
				"dev+3.5.1",
				"dev+3.5.1.slim",
				"dev+3.4.1",
				"dev+3.4.1.slim",
				"dev+3.3.1",
				"dev+3.3.1.slim",
				"dev+3.2.1",
				"dev+3.2.1.slim",
				"dev+3.1.1",
				"dev+3.1.1.slim",
				"dev+3.0.0",
				"dev+3.0.0.slim"
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
		build: {
			all: {
				src: "src/migrate.js",
				dest: "dist/jquery-migrate.js"
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
					"dist/jquery-migrate.min.js":
						[ "src/migratemute.js", "dist/jquery-migrate.js" ]
				},
				options: {
					preserveComments: false,
					sourceMap: true,
					sourceMapName: "dist/jquery-migrate.min.map",
					report: "min",
					output: {
						"ascii_only": true,

						// Support: Android 4.0 only
						// UglifyJS 3 breaks Android 4.0 if this option is not enabled.
						// This is in lieu of setting ie8 for all of mangle, compress, and output
						"ie8": true
					},
					banner: "/*! jQuery Migrate v<%= pkg.version %>" +
						" | (c) <%= pkg.author.name %> | jquery.org/license */",
					compress: {
						"hoist_funs": false,
						loops: false,

						// Support: IE <11
						// typeofs transformation is unsafe for IE9-10
						// See https://github.com/mishoo/UglifyJS2/issues/2198
						typeofs: false
					}
				}
			}
		},
		karma: {
			options: {
				customLaunchers: {
					ChromeHeadlessNoSandbox: {
						base: "ChromeHeadless",
						flags: [ "--no-sandbox" ]
					}
				},
				frameworks: [ "qunit" ],
				files: [
					"https://code.jquery.com/jquery-3.x-git.min.js",
					...karmaFilesExceptJQuery
				],
				client: {
					clearContext: false,
					qunit: {
						showUI: true,
						testTimeout: 5000
					}
				},
				reporters: [ "dots" ],
				autoWatch: false,
				concurrency: 3,
				captureTimeout: 20 * 1000,
				singleRun: true
			},
			main: {
				browsers: [ "ChromeHeadless", "FirefoxHeadless" ]
			},

			"jquery-slim": {
				browsers: [ "ChromeHeadless", "FirefoxHeadless" ],

				options: {
					files: [
						"https://code.jquery.com/jquery-3.x-git.slim.min.js",
						...karmaFilesExceptJQuery
					]
				}
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
	grunt.registerTask( "test", [
		"karma:main",
		"karma:jquery-slim"
	] );

	grunt.registerTask( "lint", [

		// Running the full eslint task without breaking it down to targets
		// would run the dist target first which would point to errors in the built
		// file, making it harder to fix them. We want to check the built file only
		// if we already know the source files pass the linter.
		"eslint:dev",
		"eslint:dist"
	] );

	grunt.registerTask( "default-no-test", [
		"build",
		"uglify",
		"lint",
		"compare_size"
	] );

	grunt.registerTask( "default", [
		"default-no-test",
		"test"
	] );

	// For CI
	grunt.registerTask( "ci", [ "default" ] );
};

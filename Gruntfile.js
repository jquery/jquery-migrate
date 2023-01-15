"use strict";

/* global module:false */

module.exports = function( grunt ) {

	const gzip = require( "gzip-js" );

	const oldNode = /^v10\./.test( process.version );

	const karmaQunitConfig = {
		showUI: true,
		testTimeout: 5000,

		// We're running `QUnit.start()` ourselves in
		// test/data/qunit-start.js
		autostart: false
	};

	const karmaFilesExceptJQueryAndMigrate = [

		// In esmodules mode only object entries of this array with `type: "js"`
		// get the `type: "module"` tweak. npo is incompatible with being loaded as
		// a module so leverage this hack to prevent loading it in this way.
		"external/npo/npo.js",

		{ pattern: "test/data/compareVersions.js", type: "js", nocache: true },

		{ pattern: "test/data/testinit.js", type: "js", nocache: true },
		{ pattern: "test/data/test-utils.js", type: "js", nocache: true },
		{ pattern: "test/unit/migrate.js", type: "js", nocache: true },
		{ pattern: "test/unit/jquery/core.js", type: "js", nocache: true },
		{ pattern: "test/unit/jquery/ajax.js", type: "js", nocache: true },
		{ pattern: "test/unit/jquery/attributes.js", type: "js", nocache: true },
		{ pattern: "test/unit/jquery/css.js", type: "js", nocache: true },
		{ pattern: "test/unit/jquery/data.js", type: "js", nocache: true },
		{ pattern: "test/unit/jquery/deferred.js", type: "js", nocache: true },
		{ pattern: "test/unit/jquery/effects.js", type: "js", nocache: true },
		{ pattern: "test/unit/jquery/event.js", type: "js", nocache: true },
		{ pattern: "test/unit/jquery/manipulation.js", type: "js", nocache: true },
		{ pattern: "test/unit/jquery/offset.js", type: "js", nocache: true },
		{ pattern: "test/unit/jquery/serialize.js", type: "js", nocache: true },
		{ pattern: "test/unit/jquery/traversing.js", type: "js", nocache: true },

		{ pattern: "test/data/qunit-start.js", type: "js", nocache: true },

		{ pattern: "dist/jquery-migrate.js", included: false, served: true, nocache: true },
		{ pattern: "test/**/*.@(js|json|css|jpg|html|xml)", included: false, served: true }
	];

	// Support: Node.js <12
	// Skip running tasks that dropped support for Node.js 10
	// in this Node version.
	function runIfNewNode( task ) {
		return oldNode ? "print_old_node_message:" + task : task;
	}

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
				"dev+3.6.3",
				"dev+3.6.3.slim",
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
		npmcopy: {
			all: {
				options: {
					destPrefix: "external"
				},
				files: {
					"npo/npo.js": "native-promise-only/lib/npo.src.js",

					"qunit/qunit.js": "qunit/qunit/qunit.js",
					"qunit/qunit.css": "qunit/qunit/qunit.css",
					"qunit/LICENSE.txt": "qunit/LICENSE.txt"
				}
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
						ascii_only: true,

						// Support: Android 4.0 only
						// UglifyJS 3 breaks Android 4.0 if this option is not enabled.
						// This is in lieu of setting ie8 for all of mangle, compress, and output
						ie8: true
					},
					banner: "/*! jQuery Migrate v<%= pkg.version %>" +
						" | (c) <%= pkg.author.name %> | jquery.org/license */",
					compress: {
						hoist_funs: false,
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
					"https://releases.jquery.com/git/jquery-3.x-git.min.js",
					"dist/jquery-migrate.min.js",
					...karmaFilesExceptJQueryAndMigrate
				],
				client: {
					clearContext: false,
					qunit: karmaQunitConfig
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
						"https://releases.jquery.com/git/jquery-3.x-git.slim.min.js",
						"dist/jquery-migrate.min.js",
						...karmaFilesExceptJQueryAndMigrate
					]
				}
			},

			esmodules: {
				browsers: [ "ChromeHeadless", "FirefoxHeadless" ],
				options: {
					files: [
						"https://releases.jquery.com/git/jquery-3.x-git.slim.min.js",
						{ pattern: "src/migrate.js", type: "module" },

						// Silence console warnings to avoid flooding the console.
						{ pattern: "src/migratemute.js", type: "module" },

						// Only object entries with `type: "js"` get
						// the `type: "module"` tweak.
						...karmaFilesExceptJQueryAndMigrate.map( file => {
							if ( file && typeof file === "object" && file.type === "js" ) {
								return {
									...file,
									type: "module"
								};
							} else {
								return file;
							}
						} ),

						{
							pattern: "src/**",
							included: false,
							type: "module",
							served: true
						}
					],
					client: {
						qunit: {
							...karmaQunitConfig,
							plugin: "esmodules"
						}
					}
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

	grunt.registerTask( "print_old_node_message", ( ...args ) => {
		var task = args.join( ":" );
		grunt.log.writeln( "Old Node.js detected, running the task \"" + task + "\" skipped..." );
	} );

	// Just an alias
	grunt.registerTask( "test", [
		"karma:main",
		"karma:jquery-slim",
		"karma:esmodules"
	] );

	grunt.registerTask( "lint", [

		// Running the full eslint task without breaking it down to targets
		// would run the dist target first which would point to errors in the built
		// file, making it harder to fix them. We want to check the built file only
		// if we already know the source files pass the linter.
		runIfNewNode( "eslint:dev" ),
		runIfNewNode( "eslint:dist" )
	] );

	grunt.registerTask( "default-no-test", [
		"npmcopy",
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

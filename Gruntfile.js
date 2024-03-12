"use strict";

/* global module:false */

module.exports = function( grunt ) {
	const gzip = require( "gzip-js" );

	const oldNode = /^v10\./.test( process.version );

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
		banners: {
			tiny: "/*! <%= pkg.name %> <%= pkg.version %> - <%= pkg.homepage %> */"
		},
		concat: {
			options: {
				banner:
					"/*!\n * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " +
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
				src: [ "Gruntfile.js", "build/**/*.js", "src/**/*.js", "test/**/*.js" ]
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
					"dist/jquery-migrate.min.js": [
						"src/migratemute.js",
						"dist/jquery-migrate.js"
					]
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
					banner:
						"/*! jQuery Migrate v<%= pkg.version %>" +
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
		grunt.log.writeln(
			"Old Node.js detected, running the task \"" + task + "\" skipped..."
		);
	} );

	grunt.registerTask( "lint", [

		// Running the full eslint task without breaking it down to targets
		// would run the dist target first which would point to errors in the built
		// file, making it harder to fix them. We want to check the built file only
		// if we already know the source files pass the linter.
		runIfNewNode( "eslint:dev" ),
		runIfNewNode( "eslint:dist" )
	] );

	grunt.registerTask( "default", [
		"npmcopy",
		"build",
		"uglify",
		"lint",
		"compare_size"
	] );
};

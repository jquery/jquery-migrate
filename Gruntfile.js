/*global module:false*/
module.exports = function(grunt) {

	"use strict";

	// The concatenated file won't pass onevar but our modules can
	var readOptionalJSON = function( filepath ) {
			var data = {};
			try {
				data = grunt.file.readJSON( filepath );
			} catch(e) {}
			return data;
		},
		srcHintOptions = readOptionalJSON("src/.jshintrc");
	delete srcHintOptions.onevar;

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		files: [
			"src/intro.js",
			"src/version.js",
			"src/migrate.js",
			"src/attributes.js",
			"src/core.js",
			"src/css.js",
			"src/ajax.js",
			"src/data.js",
			"src/manipulation.js",
			"src/effects.js",
			"src/event.js",
			"src/traversing.js",
			"src/deferred.js",
			"src/outro.js"
		],
		tests: {
			"jquery": [
				"dev+2.x-git",
				"min+2.x-git.min",
				"dev+2.2.0",
				"dev+1.x-git",
				"dev+1.12.0"
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
			options: {
				coverage: {
					disposeCollector: true,
					instrumentedFiles: "temp/",
					src: [ "dist/jquery-migrate.js" ],
					htmlReport: "coverage/",
					lcovReport: "coverage/",
					linesThresholdPct: 85
				}
			},
			files: [ "test/**/*.html" ]
		},
		coveralls: {
			src: "coverage/lcov.info",
			options: {

				// Should not fail if coveralls is down
				force: true
			}
		},
		npmcopy: {
			all: {
				options: {
					destPrefix: "external"
				},
				files: {
					"phantomjs-polyfill/bind-polyfill.js": "phantomjs-polyfill/bind-polyfill.js",
					"qunit/qunit.js": "qunitjs/qunit/qunit.js",
					"qunit/qunit.css": "qunitjs/qunit/qunit.css",
					"qunit/LICENSE.txt": "qunitjs/LICENSE.txt"				}
			}
		},
		jshint: {
			dist: {
				src: [ "dist/jquery-migrate.js" ],
				options: srcHintOptions
			},
			tests: {
				src: [ "test/*.js" ],
				options: {
					jshintrc: "test/.jshintrc"
				}
			},
			grunt: {
				src: [ "Gruntfile.js" ],
				options: {
					jshintrc: ".jshintrc"
				}
			}
		},
		uglify: {
			all: {
				files: {
					"dist/jquery-migrate.min.js": [ "src/migratemute.js", "dist/jquery-migrate.js" ]
				}
			},
			options: {
				banner: "/*! jQuery Migrate v<%= pkg.version %> | (c) <%= pkg.author.name %> | jquery.org/license */\n",
				beautify: {
					ascii_only: true
				}
			}
		},
		watch: {
			files: [ "src/*.js", "test/*.js" ],
			tasks: [ "build" ]
		},
	});

	// Load grunt tasks from NPM packages
	grunt.loadNpmTasks("grunt-git-authors");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-qunit-istanbul");
	grunt.loadNpmTasks("grunt-coveralls");
	grunt.loadNpmTasks("grunt-npmcopy");

	// Integrate jQuery migrate specific tasks
	grunt.loadTasks( "build/tasks" );

	// Just an alias
	grunt.registerTask( "test", [ "qunit" ] );

	grunt.registerTask( "build", [ "concat", "uglify", "jshint" ] );
	grunt.registerTask( "default", [ "build", "test" ] );

	// For CI
	grunt.registerTask( "ci", [ "build", "test", "coveralls" ] );
};

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
			"src/migrate.js",
			"src/attributes.js",
			"src/core.js",
			"src/ajax.js",
			"src/data.js",
			"src/manipulation.js",
			"src/event.js",
			"src/outro.js"
		],
		tests: [
			"dev+git",
			"dev+git2",
			"min+git",
			"min+git2",
			"dev+2.0.0",
			"dev+1.9.1",
			"dev+1.8.3",
			"dev+1.7.2",
			"dev+1.6.4"
		],
		banners: {
			tiny: "/*! <%= pkg.name %> <%= pkg.version %> - <%= pkg.homepage %> */"
		},
		concat: {
			options: {
				banner: "/*!\n * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " +
					"<%= grunt.template.today('yyyy-mm-dd') %>\n" +
					" * <%= pkg.homepage %>\n" +
					" * Copyright 2005, <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>;" +
					" Licensed <%= _.pluck(pkg.licenses, 'type').join(', ') %>\n */\n"
			},
			dist: {
				src: "<%= files %>",
				dest: "dist/<%= pkg.name %>.js"
			}
		},
		qunit: {
			files: [ "test/**/*.html" ]
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
				banner: "/*! jQuery Migrate v<%= pkg.version %> | (c) 2005, <%= grunt.template.today('yyyy') %> <%= pkg.author.name %> | jquery.org/license */\n",
				beautify: {
					ascii_only: true
				}
			}

		}
	});

	// Load grunt tasks from NPM packages
	grunt.loadNpmTasks("grunt-git-authors");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-qunit");

	// Default task.
	grunt.registerTask( "default", [ "concat", "uglify", "jshint", "qunit" ] );

	// Skip unit tests, used by testswarm
	grunt.registerTask( "buildnounit", [ "concat", "uglify", "jshint" ] );

	// Testswarm
	grunt.registerTask( "testswarm", function( commit, configFile ) {
		var jobName,
			testswarm = require( "testswarm" ),
			testUrls = [],
			pull = /PR-(\d+)/.exec( commit ),
			config = grunt.file.readJSON( configFile ).jquerymigrate,
			tests = grunt.config("tests");

		if ( pull ) {
			jobName = "jQuery Migrate pull <a href='https://github.com/jquery/jquery-migrate/pull/" +
				pull[ 1 ] + "'>#" + pull[ 1 ] + "</a>";
		} else {
			jobName = "jQuery Migrate commit #<a href='https://github.com/jquery/jquery-migrate/commit/" +
				commit + "'>" + commit.substr( 0, 10 ) + "</a>";
		}

		tests.forEach(function( test ) {
			var plugin_jquery = test.split("+");
			testUrls.push( config.testUrl + commit + "/test/index.html?plugin=" +
				plugin_jquery[0] + "&jquery=" + plugin_jquery[1]);
		});

		// TODO: create separate job for git/git2 so we can do different browsersets
		testswarm({
			url: config.swarmUrl,
			pollInterval: 10000,
			timeout: 1000 * 60 * 30,
			done: this.async()
		}, {
			authUsername: config.authUsername,
			authToken: config.authToken,
			jobName: jobName,
			runMax: config.runMax,
			"runNames[]": tests,
			"runUrls[]": testUrls,
			"browserSets[]": "popular-no-old-ie"
		});
	});

	// Update manifest for jQuery plugin registry
	grunt.registerTask( "manifest", function() {
		var pkg = grunt.config( "pkg" );
		grunt.file.write( "migrate.jquery.json", JSON.stringify({
			name: "migrate",
			title: pkg.title,
			description: pkg.description,
			keywords: pkg.keywords,
			version: pkg.version,
			author: {
				name: pkg.author.name,
				url: pkg.author.url.replace( "master", pkg.version )
			},
			maintainers: pkg.maintainers,
			licenses: pkg.licenses.map(function( license ) {
				license.url = license.url.replace( "master", pkg.version );
				return license;
			}),
			bugs: pkg.bugs,
			homepage: pkg.homepage,
			docs: pkg.homepage,
			download: "https://github.com/jquery/jquery-migrate/blob/" + pkg.version + "/README.md#download",
			dependencies: {
				jquery: ">=1.6.4"
			}
		}, null, "\t" ) );
	});
};

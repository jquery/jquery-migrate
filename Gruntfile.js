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
			"src/traversing.js",
			"src/outro.js"
		],
		tests: {
			"jquery-compat": [
				"dev+compat-git",
				"min+compat-git",
				"dev+1.11.1",
				"dev+1.10.2",
				"dev+1.9.1",
				"dev+1.8.3",
				"dev+1.7.2",
				"dev+1.6.4"
			],
			jquery: [
				"dev+git",
				"min+git",
				"dev+2.1.1",
				"dev+2.0.3"
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
			files: [ "test/**/*.html" ]
		},
		npmcopy: {
			all: {
				options: {
					destPrefix: "external"
				},
				files: {
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

		}
	});

	// Load grunt tasks from NPM packages
	grunt.loadNpmTasks("grunt-git-authors");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-qunit");
	grunt.loadNpmTasks("grunt-npmcopy");

	// Default task.
	grunt.registerTask( "default", [ "concat", "uglify", "jshint", "qunit" ] );

	// Skip unit tests, used by testswarm
	grunt.registerTask( "buildnounit", [ "concat", "uglify", "jshint" ] );

	// Testswarm
	grunt.registerTask( "testswarm", function( commit, configFile, destName ) {
		var jobName,
			testswarm = require( "testswarm" ),
			runs = {},
			done = this.async(),
			pull = /PR-(\d+)/.exec( commit ),
			config = grunt.file.readJSON( configFile ).jquerymigrate,
			tests = grunt.config( "tests" )[ destName ],
			browserSets = destName || config.browserSets;

		if ( browserSets[ 0 ] === "[" ) {
			// We got an array, parse it
			browserSets = JSON.parse( browserSets );
		}

		if ( pull ) {
			jobName = "Pull <a href='https://github.com/jquery/jquery-migrate/pull/" +
				pull[ 1 ] + "'>#" + pull[ 1 ] + "</a>";
		} else {
			jobName = "Commit <a href='https://github.com/jquery/jquery-migrate/commit/" +
				commit + "'>" + commit.substr( 0, 10 ) + "</a>";
		}

		tests.forEach(function( test ) {
			var plugin_jquery = test.split("+");
			runs[test] = config.testUrl + commit + "/test/index.html?plugin=" +
				plugin_jquery[0] + "&jquery=" + plugin_jquery[1];
		});

		// TODO: create separate job for compat-git/git so we can do different browsersets
		testswarm.createClient( {
			url: config.swarmUrl
		} )
		.addReporter( testswarm.reporters.cli )
		.auth( {
			id: config.authUsername,
			token: config.authToken
		})
		.addjob(
			{
				name: jobName,
				runs: runs,
				runMax: config.runMax,
				browserSets: browserSets,
				timeout: 1000 * 60 * 30
			}, function( err, passed ) {
				if ( err ) {
					grunt.log.error( err );
				}
				done( passed );
			}
		);
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

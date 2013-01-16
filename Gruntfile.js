/*global module:false*/
module.exports = function(grunt) {

	"use strict";

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
	files: [
		"src/intro.js",
		"src/migrate.js",
		"src/attributes.js",
		"src/core.js",
		"src/data.js",
		"src/manipulation.js",
		"src/event.js",
		"src/outro.js"
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
			options: {
				jshintrc: "src/.jshintrc"
			}
		},
		tests: {
			src: [ "test/**/*.js" ],
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
			sourceMap: "dist/jquery-migrate.min.map",
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

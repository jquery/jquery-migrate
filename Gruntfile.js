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
				" * Copyright <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>;" +
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
				"dist/jquery-migrate.min.js": [ "dist/jquery-migrate.js" ]
			}
		},
		options: {
			banner: "/*! jQuery v<%= pkg.version %> jquery.com | jquery.org/license */",
			sourceMap: "dist/jquery-migrate.min.map",
			beautify: {
				ascii_only: true
			},
			defines: {
				JQMIGRATE_WARN: [ "name", 0 ]
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

};

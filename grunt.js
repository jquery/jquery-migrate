/*global module:false*/
module.exports = function(grunt) {

	function readOptionalJSON( filepath ) {
		var data = {};
		try {
			data = grunt.file.readJSON( filepath );
			grunt.verbose.write( "Reading " + filepath + "..." ).ok();
		} catch(e) {}
		return data;
	}

	// Project configuration.
	grunt.initConfig({
    pkg: '<json:package.json>',
	files: [
		"src/intro.js",
		"src/attrFn.js",
		"src/browser.js",
		"src/error-event.js",
		"src/hover-event.js",
		"src/livedie.js",
		"src/quirks.js",
		"src/sub.js",
		"src/toggle-event.js",
		"src/outro.js"
	],
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', '<config:files>' ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
	lint: {
		dist: "dist/<% pkg.name %>.js",
		grunt: "grunt.js",
		tests: "test/**/*.js"
	},
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: (function() {
		function jshintrc( path ) {
			return readOptionalJSON( (path || "") + ".jshintrc" ) || {};
		}
		return {
			grunt: jshintrc(),
			dist: jshintrc( "src/" ),
			tests: jshintrc( "test/" )
		};
	}()),
	uglify: {
		codegen: {
			ascii_only: true
		}
	}
  });

  // Default task.
  grunt.registerTask('default', 'concat min lint qunit');

};

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
		"src/compat.js",
		"src/attributes.js",
		"src/core.js",
		"src/data.js",
		"src/manipulation.js",
		"src/event.js",
		"src/outro.js"
	],
    banners: {
		full: '/*!\n * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			' * <%= pkg.homepage %>\n' +
			' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
			' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n */',
		tiny: '/*! <%= pkg.name %> <%= pkg.version %> - <%= pkg.homepage %> */'
    },
    concat: {
      dist: {
        src: ['<banner:banners.full>', '<config:files>' ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:banners.tiny>', '<config:files>'],
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
      tasks: 'concat min lint'
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
		},
		mangle: {
			defines: {
				JQCOMPAT_WARN: [ "name", 0 ]
			}
		}
	}
  });

  // Default task.
  grunt.registerTask('default', 'concat min lint qunit');

};

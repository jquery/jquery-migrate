/**
 * A build task that compiles jQuery Migrate JS modules into one bundle.
 */

"use strict";

module.exports = function( grunt ) {
	const path = require( "path" );
	const rollup = require( "rollup" );
	const rootFolder = path.resolve( `${ __dirname }/../..` );
	const srcFolder = path.resolve( `${ rootFolder }/src` );
	const read = function( fileName ) {
		return grunt.file.read( `${ srcFolder }/${ fileName }` );
	};

	// Catch `// @CODE` and subsequent comment lines event if they don't start
	// in the first column.
	const wrapper = read( "wrapper.js" )
		.split( /[\x20\t]*\/\/ @CODE\n(?:[\x20\t]*\/\/[^\n]+\n)*/ );

	const inputRollupOptions = {};
	const outputRollupOptions = {

		// The ESM format is not actually used as we strip it during
		// the build; it's just that it doesn't generate any extra
		// wrappers so there's nothing for us to remove.
		format: "esm",

		intro: wrapper[ 0 ]
			.replace( /\n*$/, "" ),
		outro: wrapper[ 1 ]
			.replace( /^\n*/, "" )
	};

	grunt.registerMultiTask(
		"build",
		"Build jQuery Migrate ECMAScript modules, embed date/version",
	async function() {
		const done = this.async();

		try {
			const version = grunt.config( "pkg.version" );
			const dest = this.files[ 0 ].dest;
			const src = this.files[ 0 ].src[ 0 ];

			inputRollupOptions.input = path.resolve( `${ rootFolder }/${ src }` );

			const bundle = await rollup.rollup( inputRollupOptions );

			const { output: [ { code } ] } = await bundle.generate( outputRollupOptions );

			const compiledContents = code

				// Embed Version
				.replace( /@VERSION/g, version )

				// Embed Date
				// yyyy-mm-ddThh:mmZ
				.replace(
					/@DATE/g,
					( new Date() ).toISOString()
						.replace( /:\d+\.\d+Z$/, "Z" )
				);

			grunt.file.write( `${ rootFolder }/${ dest }`, compiledContents );
			grunt.log.ok( `File '${ dest }' created.` );
			done();
		} catch ( err ) {
			done( err );
		}
	} );
};

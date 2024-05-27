/**
 * A build task that compiles jQuery Migrate JS modules into one bundle.
 */

import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as rollup from "rollup";
import { minify } from "./minify.js";
import { getTimestamp } from "./lib/getTimestamp.js";
import { compareSize } from "./compare_size.js";
import util from "node:util";
import { exec as nodeExec } from "node:child_process";
import { isCleanWorkingDir } from "./lib/isCleanWorkingDir.js";

const exec = util.promisify( nodeExec );

function read( filename ) {
	return readFile( filename, "utf8" );
}

async function readJSON( filename ) {
	return JSON.parse( await read( filename ) );
}

async function writeCompiled( { code, dir, filename, version } ) {
	const compiledContents = code

		// Embed Version
		.replace( /@VERSION/g, version )

		// Embed Date
		// yyyy-mm-ddThh:mmZ
		.replace( /@DATE/g, new Date().toISOString().replace( /:\d+\.\d+Z$/, "Z" ) );

	await writeFile( path.join( dir, filename ), compiledContents );
	console.log( `[${ getTimestamp() }] ${ filename } v${ version } created.` );
	await minify( { dir, filename, version } );
}

export async function build( {
	dir = "dist",
	filename = "jquery-migrate.js",
	watch = false,
	version
} = {} ) {

	const pkg = await readJSON( "package.json" );

	// Add the short commit hash to the version string
	// when the version is not for a release.
	if ( !version ) {
		const { stdout } = await exec( "git rev-parse --short HEAD" );
		const isClean = await isCleanWorkingDir();

		// "+SHA" is semantically correct
		// Add ".dirty" as well if the working dir is not clean
		version = `${ pkg.version }+${ stdout.trim() }${
			isClean ? "" : ".dirty"
		}`;
	}

	// Catch `// @CODE` and subsequent comment lines event if they don't start
	// in the first column.
	const wrapperSrc = await read( "src/wrapper.js" );
	const wrapper = wrapperSrc.split(
		/[\x20\t]*\/\/ @CODE\n(?:[\x20\t]*\/\/[^\n]+\n)*/
	);

	const inputRollupOptions = {};
	const outputRollupOptions = {

		// The ESM format is not actually used as we strip it during
		// the build; it's just that it doesn't generate any extra
		// wrappers so there's nothing for us to remove.
		format: "esm",

		intro: wrapper[ 0 ].replace( /\n*$/, "" ),
		outro: wrapper[ 1 ].replace( /^\n*/, "" )
	};
	const src = "src/migrate.js";

	inputRollupOptions.input = path.resolve( src );

	await mkdir( dir, { recursive: true } );

	if ( watch ) {
		const watcher = rollup.watch( {
			...inputRollupOptions,
			output: [ outputRollupOptions ],
			watch: {
				include: "src/**",
				skipWrite: true
			}
		} );

		watcher.on( "event", async( event ) => {
			switch ( event.code ) {
				case "ERROR":
					console.error( event.error );
					break;
				case "BUNDLE_END":
					const {
						output: [ { code } ]
					} = await event.result.generate( outputRollupOptions );

					await writeCompiled( {
						code,
						dir,
						filename,
						version
					} );
					break;
			}
		} );

		return watcher;
	} else {
		const bundle = await rollup.rollup( inputRollupOptions );

		const {
			output: [ { code } ]
		} = await bundle.generate( outputRollupOptions );

		await writeCompiled( { code, dir, filename, version } );

		return compareSize( {
			files: [ "dist/jquery-migrate.min.js" ]
		} );
	}
}

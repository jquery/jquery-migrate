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

async function getOutputRollupOptions( {
	esm = false
} = {} ) {
	const wrapperFilePath = path.join( "src", `wrapper${
		esm ? "-esm" : ""
	}.js` );

	const wrapperSource = await read( wrapperFilePath );

	// Catch `// @CODE` and subsequent comment lines event if they don't start
	// in the first column.
	const wrapper = wrapperSource.split(
		/[\x20\t]*\/\/ @CODE\n(?:[\x20\t]*\/\/[^\n]+\n)*/
	);

	return {

		// The ESM format is not actually used as we strip it during the
		// build, inserting our own wrappers; it's just that it doesn't
		// generate any extra wrappers so there's nothing for us to remove.
		format: "esm",

		intro: wrapper[ 0 ].replace( /\n*$/, "" ),
		outro: wrapper[ 1 ].replace( /^\n*/, "" )
	};
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
}

export async function build( {
	dir = "dist",
	filename = "jquery-migrate.js",
	esm = false,
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

	const inputRollupOptions = {};
	const outputRollupOptions = await getOutputRollupOptions( { esm } );
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
		await minify( { dir, filename, version } );
	}
}

export async function buildDefaultFiles( {
	version = process.env.VERSION,
	watch
} = {} ) {
	await Promise.all( [
		build( { version, watch } ),
		build( {
			dir: "dist-module",
			filename: "jquery-migrate.module.js",
			esm: true,
			version,
			watch
		} )
	] );

	if ( watch ) {
		console.log( "Watching files..." );
	} else {
		return compareSize( {
			files: [
				"dist/jquery-migrate.min.js",
				"dist-module/jquery-migrate.module.min.js"
			]
		} );
	}
}

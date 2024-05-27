import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const projectDir = path.resolve( "." );

const files = {
	"npo/npo.js": "native-promise-only/lib/npo.src.js",

	"qunit/qunit.js": "qunit/qunit/qunit.js",
	"qunit/qunit.css": "qunit/qunit/qunit.css",
	"qunit/LICENSE.txt": "qunit/LICENSE.txt"
};

async function npmcopy() {
	await mkdir( path.resolve( projectDir, "external" ), {
		recursive: true
	} );
	for ( const [ dest, source ] of Object.entries( files ) ) {
		const from = path.resolve( projectDir, "node_modules", source );
		const to = path.resolve( projectDir, "external", dest );
		const toDir = path.dirname( to );
		await mkdir( toDir, { recursive: true } );
		await copyFile( from, to );
		console.log( `${ source } → ${ dest }` );
	}
}

npmcopy();

import yargs from "yargs/yargs";
import { build } from "./tasks/build.js";

const argv = yargs( process.argv.slice( 2 ) )
	.version( false )
	.command( {
		command: "[options]",
		describe: "Build a jQuery Migrate bundle"
	} )
	.option( "filename", {
		alias: "f",
		type: "string",
		description:
			"Set the filename of the built file. Defaults to jquery.js."
	} )
	.option( "dir", {
		alias: "d",
		type: "string",
		description:
			"Set the dir to which to output the built file. Defaults to /dist."
	} )
	.option( "version", {
		alias: "v",
		type: "string",
		description:
			"Set the version to include in the built file. " +
			"Defaults to the version in package.json plus the " +
			"short commit SHA and any excluded modules."
	} )
	.option( "watch", {
		alias: "w",
		type: "boolean",
		description:
			"Watch the source files and rebuild when they change."
	} )
	.option( "esm", {
		type: "boolean",
		description:
			"Build an ES module (ESM) bundle. " +
			"By default, a UMD bundle is built."
	} )
	.help()
	.argv;

build( argv );

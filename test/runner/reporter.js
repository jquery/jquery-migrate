import chalk from "chalk";
import { getBrowserString } from "./lib/getBrowserString.js";
import { prettyMs } from "./lib/prettyMs.js";
import * as Diff from "diff";

export function reportTest( test, reportId, { browser, headless } ) {
	if ( test.status === "passed" ) {

		// Write to console without newlines
		process.stdout.write( "." );
		return;
	}

	let message = `${ chalk.bold( `${ test.suiteName }: ${ test.name }` ) }`;
	message += `\nTest ${ test.status } on ${ chalk.yellow(
		getBrowserString( browser, headless )
	) } (${ chalk.bold( reportId ) }).`;

	// test.assertions only contains passed assertions;
	// test.errors contains all failed asssertions
	if ( test.errors.length ) {
		for ( const error of test.errors ) {
			message += "\n";
			if ( error.message ) {
				message += `\n${ error.message }`;
			}
			message += `\n${ chalk.gray( error.stack ) }`;
			if ( "expected" in error && "actual" in error ) {
				message += `\nexpected: ${ JSON.stringify( error.expected ) }`;
				message += `\nactual: ${ JSON.stringify( error.actual ) }`;
				let diff;

				if ( Array.isArray( error.expected ) && Array.isArray( error.actual ) ) {

					// Diff arrays
					diff = Diff.diffArrays( error.expected, error.actual );
				} else if (
					typeof error.expected === "object" &&
					typeof error.actual === "object"
				) {

					// Diff objects
					diff = Diff.diffJson( error.expected, error.actual );
				} else if (
					typeof error.expected === "number" &&
					typeof error.expected === "number"
				) {

					// Diff numbers directly
					const value = error.actual - error.expected;
					if ( value > 0 ) {
						diff = [ { added: true, value: `+${ value }` } ];
					} else {
						diff = [ { removed: true, value: `${ value }` } ];
					}
				} else if (
					typeof error.expected === "boolean" &&
					typeof error.actual === "boolean"
				) {

					// Show the actual boolean in red
					diff = [ { removed: true, value: `${ error.actual }` } ];
				} else {

					// Diff everything else as characters
					diff = Diff.diffChars( `${ error.expected }`, `${ error.actual }` );
				}

				message += "\n";
				message += diff
					.map( ( part ) => {
						if ( part.added ) {
							return chalk.green( part.value );
						}
						if ( part.removed ) {
							return chalk.red( part.value );
						}
						return chalk.gray( part.value );
					} )
					.join( "" );
			}
		}
	}

	console.log( `\n\n${ message }` );

	// Only return failed messages
	if ( test.status === "failed" ) {
		return message;
	}
}

export function reportEnd(
	result,
	reportId,
	{ browser, headless, jquery, jqueryMigrate, modules }
) {
	const fullBrowser = getBrowserString( browser, headless );
	console.log(
		`\n\nTests finished in ${ prettyMs( result.runtime ) } ` +
			`for ${ chalk.yellow( modules.join( ", " ) ) } ` +
			`for jQuery Migrate ${ chalk.yellow( jqueryMigrate ) } ` +
			`and jQuery ${ chalk.yellow( jquery ) } ` +
			`in ${ chalk.yellow( fullBrowser ) } (${ chalk.bold( reportId ) })...`
	);
	console.log(
		( result.status !== "passed" ?
			`${ chalk.red( result.testCounts.failed ) } failed. ` :
			"" ) +
			`${ chalk.green( result.testCounts.total ) } passed. ` +
			`${ chalk.gray( result.testCounts.skipped ) } skipped.`
	);
	return result.testCounts;
}

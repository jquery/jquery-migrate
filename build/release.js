#!/usr/bin/env node
/*
 * jQuery Migrate Plugin Release Management
 */

// Debugging variables
var	debug = false,
	skipRemote = false;

var fs = require("fs"),
	child = require("child_process"),
	path = require("path");

var releaseVersion,
	nextVersion,
	finalFiles,
	isBeta,
	pkg,

	scpURL = "jqadmin@code.origin.jquery.com:/var/www/html/code.jquery.com/",
	cdnURL = "http://code.origin.jquery.com/",
	repoURL = "git://github.com/jquery/jquery-migrate.git",
	branch = "master",

	// Windows needs the .cmd version but will find the non-.cmd
	// On Windows, ensure the HOME environment variable is set
	gruntCmd = process.platform === "win32" ? "grunt.cmd" : "grunt",

	readmeFile = "README.md",
	devFile = "dist/jquery-migrate.js",
	minFile = "dist/jquery-migrate.min.js",

	releaseFiles = {
		"jquery-migrate-VER.js": devFile,
		"jquery-migrate-VER.min.js": minFile
	};

steps(
	initialize,
	checkGitStatus,
	updateReadme,
	tagReleaseVersion,
	gruntBuild,
	makeReleaseCopies,
	setNextVersion,
	uploadToCDN,
	pushToGithub,
	exit
);

function initialize( next ) {

	if ( process.argv[2] === "-d" ) {
		process.argv.shift();
		debug = true;
		console.warn("=== DEBUG MODE ===" );
	}

	// First arg should be the version number being released
	var newver, oldver,
		rversion = /^(\d)\.(\d+)\.(\d)((?:a|b|rc)\d|pre)?$/,
		version = ( process.argv[2] || "" ).toLowerCase().match( rversion ) || {},
		major = version[1],
		minor = version[2],
		patch = version[3],
		xbeta = version[4];


	releaseVersion = process.argv[2];
	isBeta = !!xbeta;

	if ( !major || !minor || !patch ) {
		die( "Usage: " + process.argv[1] + " releaseVersion" );
	}
	if ( xbeta === "pre" ) {
		die( "Cannot release a 'pre' version!" );
	}
	if ( !(fs.existsSync || path.existsSync)( "package.json" ) ) {
		die( "No package.json in this directory" );
	}
	pkg = JSON.parse( fs.readFileSync( "package.json" ) );

	log( "Current version is " + pkg.version + "; generating release " + releaseVersion );
	version = pkg.version.match( rversion );
	oldver = ( +version[1] ) * 10000 + ( +version[2] * 100 ) + ( +version[3] )
	newver = ( +major ) * 10000 + ( +minor * 100 ) + ( +patch );
	if ( newver < oldver ) {
		die( "Next version is older than current version!" );
	}

	nextVersion = major + "." + minor + "." + ( isBeta ? patch : +patch + 1 ) + "pre";
	next();
}

function checkGitStatus( next ) {
	git( [ "status" ], function( error, stdout, stderr ) {
		if ( /Changes to be committed/i.test( stdout ) ) {
			die("Please commit changed files before attemping to push a release.");
		}
		if ( /Changes not staged for commit/i.test( stdout ) ) {
			die("Please stash files before attempting to push a release.");
		}
		next();
	});
}

function tagReleaseVersion( next ) {
	updatePackageVersion( releaseVersion );
	git( [ "commit", "-a", "-m", "Tagging the " + releaseVersion + " release." ], function(){
		git( [ "tag", releaseVersion ], next);
	});
}

function updateReadme( next ) {
	var readme = fs.readFileSync( readmeFile, "utf8" );

	log("Updating " + readmeFile );
	if ( !debug ) {
		// Change version references from the old version to the new one
		// Be sure to allow 1.0.0b2 and such
		readme = readme
			.replace( /jquery-migrate-\d+\.\d+\.\w+/g, "jquery-migrate-" + releaseVersion );
		fs.writeFileSync( readmeFile, readme );
	}
	next();
}

function gruntBuild( next ) {
	exec( gruntCmd, [], function( error, stdout ) {
		if ( error ) {
			die( error + stderr );
		}
		log( stdout );
		next();
	});
}

function makeReleaseCopies( next ) {
	finalFiles = {};
	Object.keys( releaseFiles ).forEach(function( key ) {
		var builtFile = releaseFiles[ key ],
			releaseFile = key.replace( /VER/g, releaseVersion );

		copy( builtFile, releaseFile );
		finalFiles[ releaseFile ] = builtFile;
	});
	next();
}

function setNextVersion( next ) {
	updatePackageVersion( nextVersion );
	git( [ "commit", "-a", "-m", "Updating the source version to " + nextVersion ], next );
}

function uploadToCDN( next ) {
	var cmds = [];

	Object.keys( finalFiles ).forEach(function( name ) {
		cmds.push(
			function( nxt ){
				exec( "scp", [ name, scpURL ], nxt, skipRemote );
			},
			function( nxt ){
				exec( "curl", [ cdnURL + name + "?reload" ], nxt, skipRemote );
			}
		);
	});
	cmds.push( next );
	
	steps.apply( this, cmds );
}

function pushToGithub( next ) {
	git( [ "push", "--tags", repoURL, branch ], next, skipRemote );
}

//==============================

function steps() {
	var cur = 0,
		steps = arguments;
	(function next(){
		var step = steps[ cur++ ];
		step( next );
	})();
}

function updatePackageVersion( ver ) {
	log( "Updating package.json version to " + ver );
	pkg.version = ver;
	if ( !debug ) {
		fs.writeFileSync( "package.json", JSON.stringify( pkg, null, "\t" ) + "\n" );
	}
}

function copy( oldFile, newFile ) {
	log( "Copying " + oldFile + " to " + newFile );
	if ( !debug ) {
		fs.writeFileSync( newFile, fs.readFileSync( oldFile, "utf8" ) );
	}
}

function git( args, fn, skip ) {
	exec( "git", args, fn, skip );
}

function exec( cmd, args, fn, skip ) {
	if ( debug || skip ) {
		log( "# " + cmd + " " + args.join(" ") );
		fn();
	} else {
		log( cmd + " " + args.join(" ") );
		child.execFile( cmd, args, { env: process.env }, 
			function( err, stdout, stderr ) {
				if ( err ) {
					die( stderr || stdout || err );
				}
				fn();
			}
		);
	}
}

function log( msg ) {
	console.log( msg );
}

function die( msg ) {
	console.error( "ERROR: " + msg );
	process.exit( 1 );
}

function exit() {
	process.exit( 0 );
}

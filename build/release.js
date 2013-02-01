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
	repoURL = "git@github.com:jquery/jquery-migrate.git",
	branch = "master",

	// Windows needs the .cmd version but will find the non-.cmd
	// On Windows, ensure the HOME environment variable is set
	gruntCmd = process.platform === "win32" ? "grunt.cmd" : "grunt",

	readmeFile = "README.md",
	packageFile = "package.json",
	pluginFile = "migrate.jquery.json",
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
	pushToRemote,
	exit
);

function initialize( next ) {

	if ( process.argv[2] === "-d" ) {
		process.argv.shift();
		debug = true;
		console.warn("=== DEBUG MODE ===" );
	}

	// First arg should be the version number being released; this is a proper subset
	// of a full semver, see https://github.com/mojombo/semver/issues/32
	// Examples: 1.0.1, 1.0.1-pre, 1.0.1-rc1, 1.0.1-rc1.1
	var newver, oldver,
		rsemver = /^(\d+)\.(\d+)\.(\d+)(?:-([\dA-Za-z\-]+(?:\.[\dA-Za-z\-]+)*))?$/,
		version = rsemver.exec( process.argv[2] || "" ) || [],
		major = version[1],
		minor = version[2],
		patch = version[3],
		xbeta = version[4];


	releaseVersion = process.argv[2];
	isBeta = !!xbeta;

	if ( !releaseVersion ) {
		die( "Usage: release [ -d ] releaseVersion" );
	}
	if ( !version.length ) {
		die( "'" + releaseVersion + "' is not a valid semver!" );
	}
	if ( xbeta === "pre" ) {
		die( "Cannot release a 'pre' version!" );
	}
	if ( !(fs.existsSync || path.existsSync)( packageFile ) ) {
		die( "No " + packageFile + " in this directory" );
	}
	pkg = JSON.parse( fs.readFileSync( packageFile ) );

	log( "Current version is " + pkg.version + "; generating release " + releaseVersion );
	version = rsemver.exec( pkg.version );
	oldver = ( +version[1] ) * 10000 + ( +version[2] * 100 ) + ( +version[3] )
	newver = ( +major ) * 10000 + ( +minor * 100 ) + ( +patch );
	if ( newver < oldver ) {
		die( "Next version is older than current version!" );
	}

	nextVersion = major + "." + minor + "." + ( isBeta ? patch : +patch + 1 ) + "-pre";
	next();
}

//TODO: Check that remote doesn't have newer commits:
// git fetch repoURL
// git remote show repoURL
// (look for " BRANCH     pushes to BRANCH     (up to date)")

function checkGitStatus( next ) {
	child.execFile( "git", [ "status" ], function( error, stdout, stderr ) {
		var onBranch = ((stdout||"").match( /On branch (\S+)/ ) || [])[1];
		if ( onBranch !== branch ) {
			die( "Branches don't match: Wanted " + branch + ", got " + onBranch );
		}
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
	updatePluginVersion( releaseVersion );
	git( [ "commit", "-a", "-m", "Tagging the " + releaseVersion + " release." ], function(){
		git( [ "tag", releaseVersion ], next);
	});
}

function updateReadme( next ) {
	var readme = fs.readFileSync( readmeFile, "utf8" );

	// Change version references from the old version to the new one;
	// Only release versions should be updated which simplifies the regex
	if ( isBeta ) {
		log( "Skipping " + readmeFile + " update (beta release)" );
	} else { 
		log( "Updating " + readmeFile );
		readme = readme
			.replace( /jquery-migrate-\d+\.\d+\.\d+/g, "jquery-migrate-" + releaseVersion );
		if ( !debug ) {
			fs.writeFileSync( readmeFile, readme );
		}
	}
	next();
}

function gruntBuild( next ) {
	exec( gruntCmd, [], function( error, stdout ) {
		if ( error ) {
			die( error + stderr );
		}
		log( stdout || "(no output)" );
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
	updatePackageVersion( nextVersion, "master" );
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

function pushToRemote( next ) {
	git( [ "push", "--tags", repoURL, branch ], next, skipRemote );
}

//==============================

function steps() {
	var cur = 0,
		steps = arguments;
	(function next(){
		process.nextTick(function(){
			steps[ cur++ ]( next );
		});
	})();
}

function updatePackageVersion( ver, blobVer ) {
	log( "Updating " + packageFile + " version to " + ver );
	blobVer = blobVer || ver;
	pkg.version = ver;
	pkg.author.url = setBlobVersion( pkg.author.url, blobVer );
	pkg.licenses[0].url = setBlobVersion( pkg.licenses[0].url, blobVer );
	writeJsonSync( packageFile, pkg );
}

function updatePluginVersion( ver ) {
	var plug;

	log( "Updating " + pluginFile + " version to " + ver );
	plug = JSON.parse( fs.readFileSync( pluginFile ) );
	plug.version = ver;
	plug.author.url = setBlobVersion( plug.author.url, ver );
	plug.licenses[0].url = setBlobVersion( plug.licenses[0].url, ver );
	plug.download = setBlobVersion( plug.download, ver );
	writeJsonSync( pluginFile, plug );
}

function setBlobVersion( s, v ) {
	return s.replace( /\/blob\/(?:(\d+\.\d+[^\/]+)|master)/, "/blob/" + v );
}

function writeJsonSync( fname, json ) {
	if ( debug ) {
		console.log( JSON.stringify( json, null, "  " ) );
	} else {
		fs.writeFileSync( fname, JSON.stringify( json, null, "\t" ) + "\n" );
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

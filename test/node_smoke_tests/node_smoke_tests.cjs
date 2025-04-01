"use strict";

console.log( "Running Node.js smoke tests..." );

const assert = require( "node:assert/strict" );
const { JSDOM } = require( "jsdom" );

const { window } = new JSDOM( "<!DOCTYPE html><title>$</title>" );

// Set the window global.
globalThis.window = window;

const $ = require( "jquery-migrate" );

assert( /^jQuery/.test( $.expando ),
	"jQuery.expando was not detected, the jQuery bootstrap process has failed" );

assert( typeof $.migrateVersion === "string" && $.migrateVersion.length > 0,
	"jQuery.migrateVersion was not detected, the jQuery Migrate bootstrap process has failed" );

console.log( "Node.js smoke tests passed." );

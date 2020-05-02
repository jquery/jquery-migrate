"use strict";

QUnit.module( "manipulation" );

QUnit.test( "Improperly closed elements", function( assert ) {
	assert.expect( 4 );

	var oldWindowAlert = window.alert;
	window.alert = function() {
		assert.notOk( "Called alert with " + arguments );
	};

	expectWarning( assert, "Elements not self-closable nested wrong", 4, function() {
		jQuery( "<div><p/><span/></div>" );
		jQuery( "<blockquote><p class='bad' /><span/></blockquote>" );
		jQuery( "<div />" ).append( "<div data-borked='y'><span/> <p/></div>" );
		jQuery( "<script /><div class=afterscript/>" );
	} );

	expectNoWarning( assert, "Script doesn't run in processed strings", function() {
		jQuery( "<script>alert( 'YOU SHOULD NOT SEE THIS ALERT' )</script>" );
		jQuery( "<div>" ).append( "<script src='YOU-SHOULD-NOT-SEE-THIS.SCRIPT'></script>" );
		jQuery( "<script>alert( 'YOU SHOULD NOT SEE THIS CONSOLE' )</script>" );
	} );

	expectNoWarning( assert, "Elements not self-closable but tolerable", function() {
		jQuery( "<div class=wonky />" );
		jQuery( "<p style='width: 2%' />" );
		jQuery( "<p />" ).append( "<span aria-label='hello' />" );
	} );

	expectNoWarning( assert, "Bare elements", function() {
		jQuery( "<p/>" ).append( "<strong>" );
		jQuery( "<abbr />" );
		jQuery( "<head />" );
	} );

	window.alert = oldWindowAlert;
} );

// Do this as iframe because there is no way to undo `jQuery.UNSAFE_restoreLegacyHtmlPrefilter()`
TestManager.runIframeTest( "jQuery.UNSAFE_restoreLegacyHtmlPrefilter",
	"manipulation-UNSAFE_restoreLegacyHtmlPrefilter.html",
	function( assert, jQuery, window, document, log, childCount, firstNodeName, secondNodeName ) {
		assert.expect( 5 );

		var warns = jQuery.migrateWarnings;

		assert.strictEqual( childCount, 2, "Proper child count" );
		assert.strictEqual( firstNodeName, "div", "Proper first element" );
		assert.strictEqual( secondNodeName, "span", "Proper second element" );

		assert.equal( warns.length, 1, "Proper warning length" );
		assert.ok( warns[ 0 ].indexOf( "HTML tags" ) >= 0, warns[ 0 ] );
	} );

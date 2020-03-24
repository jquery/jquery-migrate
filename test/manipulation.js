"use strict";

QUnit.module( "manipulation" );

// Do this as iframe because there is no way to undo `jQuery.UNSAFE_restoreLegacyHtmlPrefilter()`
TestManager.runIframeTest( "jQuery.UNSAFE_restoreLegacyHtmlPrefilter",
	"manipulation-UNSAFE_restoreLegacyHtmlPrefilter.html",
	function( assert, jQuery, window, document, log, childCount, firstNodeName, secondNodeName ) {
		assert.expect( 3 );

		assert.strictEqual( childCount, 2, "Proper child count" );
		assert.strictEqual( firstNodeName, "div", "Proper first element" );
		assert.strictEqual( secondNodeName, "span", "Proper second element" );
	} );

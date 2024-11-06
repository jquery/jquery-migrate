"use strict";

QUnit.module( "manipulation" );

QUnit.test( "Improperly closed elements", function( assert ) {
	assert.expect( 4 );

	var oldWindowAlert = window.alert;
	window.alert = function() {
		assert.notOk( "Called alert with " + arguments );
	};

	jQuery.migrateEnablePatches( "self-closed-tags" );

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

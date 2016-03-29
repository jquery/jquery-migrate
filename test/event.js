
module( "event" );

test( "error() event method", function() {
	expect( 2 );

	expectWarning( "jQuery.fn.error()", function() {
		jQuery( "<img />" )
			.error( function() {
				ok( true, "Triggered error event" );
			} )
			.error()
			.off( "error" )
			.error()
			.remove();
	} );
} );

test( "load() and unload() event methods", function() {
	expect( 5 );

	expectWarning( "jQuery.fn.load()", function() {
		jQuery( "<img />" )
			.load( function() {
				ok( true, "Triggered load event" );
			} )
			.load()
			.off( "load" )
			.load()
			.remove();
	} );

	expectWarning( "jQuery.fn.unload()", function() {
		jQuery( "<img />" )
			.unload( function() {
				ok( true, "Triggered unload event" );
			} )
			.unload()
			.off( "unload" )
			.unload()
			.remove();
	} );

	expectNoWarning( "ajax load", function() {
		stop();
		jQuery( "<div id=load138></div>" )
			.appendTo( "#qunit-fixture" )
			.load( "not-found.file", function() {
				jQuery( "#load138" ).remove();
				start();
			} );
	} );
} );

test( "custom ready", function() {
	expect( 2 );

	expectNoWarning( "Custom ready event not on document", 1, function() {
		jQuery( "#foo" ).on( "ready", function( e ) {
			ok( true, "custom ready event was triggered" );
		} )
		.trigger( "ready" )
		.off( "ready" );
	} );
} );

TestManager.runIframeTest( "document ready", "ready-event.html",
	function( fired, warnings, assert ) {
		assert.expect( 2 );

		assert.ok( fired, "ready event fired" );
		assert.equal( warnings.length, 1, "warnings: " + JSON.stringify( warnings ) );
	} );

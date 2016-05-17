
module( "event" );

test( "error() event method", function( assert ) {
	assert.expect( 2 );

	expectWarning( "jQuery.fn.error()", function() {
		jQuery( "<img />" )
			.error( function() {
				assert.ok( true, "Triggered error event" );
			} )
			.error()
			.off( "error" )
			.error()
			.remove();
	} );
} );

test( "load() and unload() event methods", function( assert ) {
	assert.expect( 5 );

	expectWarning( "jQuery.fn.load()", function() {
		jQuery( "<img />" )
			.load( function() {
				assert.ok( true, "Triggered load event" );
			} )
			.load()
			.off( "load" )
			.load()
			.remove();
	} );

	expectWarning( "jQuery.fn.unload()", function() {
		jQuery( "<img />" )
			.unload( function() {
				assert.ok( true, "Triggered unload event" );
			} )
			.unload()
			.off( "unload" )
			.unload()
			.remove();
	} );

	expectNoWarning( "ajax load", function() {
		var start = assert.async();
		jQuery( "<div id=load138></div>" )
			.appendTo( "#qunit-fixture" )
			.load( "not-found.file", function() {
				jQuery( "#load138" ).remove();
				start();
			} );
	} );
} );

QUnit.test( ".bind() and .unbind()", function( assert ) {
	assert.expect( 3 );

	var $elem = jQuery( "<div />" ).appendTo( "#qunit-fixture" );

	expectWarning( ".bind()", 1, function() {
		$elem
			.bind( "click", function() {
				assert.ok( true, "click fired" );
			} )
			.trigger( "click" );
	} );

	expectWarning( ".unbind()", 1, function() {
		$elem
			.unbind( "click" )
			.trigger( "click" );
	} );
} );

QUnit.test( ".delegate() and .undelegate()", function( assert ) {
	assert.expect( 3 );

	var $div = jQuery( "<div />" ).appendTo( "#qunit-fixture" );

	jQuery( "<p />" ).appendTo( $div );

	expectWarning( ".delegate()", 1, function() {
		$div
			.delegate( "p", "click", function() {
				assert.ok( true, "delegated click fired" );
			} )
			.find( "p" ).trigger( "click" );
	} );

	expectWarning( ".undelegate()", 1, function() {
		$div
			.undelegate( "p", "click" )
			.find( "p" ).trigger( "click" );
	} );
} );

test( "custom ready", function( assert ) {
	assert.expect( 2 );

	expectNoWarning( "Custom ready event not on document", 1, function() {
		jQuery( "#foo" ).on( "ready", function( e ) {
			assert.ok( true, "custom ready event was triggered" );
		} )
		.trigger( "ready" )
		.off( "ready" );
	} );
} );

TestManager.runIframeTest( "document ready", "ready-event.html",
	function( assert, jQuery, window, document, log ) {
		assert.expect( 1 );

		assert.equal( jQuery.migrateWarnings.length, 1, "warnings: " +
			JSON.stringify( jQuery.migrateWarnings ) );
	} );

// Do this as iframe because there is no way to undo prop addition
TestManager.runIframeTest( "jQuery.event.props", "event-props.html",
	function( assert, jQuery, window, document, log, test1, test2 ) {
		assert.expect( 2 );

		assert.ok( test1 && test2, "props were processed" );
		assert.equal( jQuery.migrateWarnings.length, 2, "warnings: " +
			JSON.stringify( jQuery.migrateWarnings ) );
	} );

// Do this as iframe because there is no way to undo prop addition
TestManager.runIframeTest( "jQuery.event.fixHooks", "event-fixHooks.html",
	function( assert, jQuery, window, document, log, test1, test2 ) {
		assert.expect( 2 );

		assert.ok( test1 && test2, "hooks were processed" );
		assert.equal( jQuery.migrateWarnings.length, 2, "warnings: " +
			JSON.stringify( jQuery.migrateWarnings ) );
	} );

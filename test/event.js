
QUnit.module( "event" );

QUnit.test( "error() event method", function( assert ) {
	assert.expect( 2 );

	expectWarning( assert, "jQuery.fn.error()", function() {
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

QUnit.test( "load() and unload() event methods", function( assert ) {
	assert.expect( 5 );

	expectWarning( assert, "jQuery.fn.load()", function() {
		jQuery( "<img />" )
			.load( function() {
				assert.ok( true, "Triggered load event" );
			} )
			.load()
			.off( "load" )
			.load()
			.remove();
	} );

	expectWarning( assert, "jQuery.fn.unload()", function() {
		jQuery( "<img />" )
			.unload( function() {
				assert.ok( true, "Triggered unload event" );
			} )
			.unload()
			.off( "unload" )
			.unload()
			.remove();
	} );

	expectNoWarning( assert, "ajax load", function() {
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

	expectWarning( assert, ".bind()", 1, function() {
		$elem
			.bind( "click", function() {
				assert.ok( true, "click fired" );
			} )
			.trigger( "click" );
	} );

	expectWarning( assert, ".unbind()", 1, function() {
		$elem
			.unbind( "click" )
			.trigger( "click" );
	} );
} );

QUnit.test( ".delegate() and .undelegate()", function( assert ) {
	assert.expect( 3 );

	var $div = jQuery( "<div />" ).appendTo( "#qunit-fixture" );

	jQuery( "<p />" ).appendTo( $div );

	expectWarning( assert, ".delegate()", 1, function() {
		$div
			.delegate( "p", "click", function() {
				assert.ok( true, "delegated click fired" );
			} )
			.find( "p" ).trigger( "click" );
	} );

	expectWarning( assert, ".undelegate()", 1, function() {
		$div
			.undelegate( "p", "click" )
			.find( "p" ).trigger( "click" );
	} );
} );

QUnit.test( "Event aliases", function( assert ) {
	assert.expect( 14 );

	var $div = jQuery( "<div />" );

	"scroll click submit keydown".split( " " ).forEach( function( name ) {
		expectWarning( assert, "." + name + "()", 1, function() {
			$div[ name ]( function( event ) {
				assert.equal( event.type, name, name );
				$div.off( event );
			} )[ name ]();
		} );
	} );

	expectWarning( assert, ".hover() one-arg", 1, function() {
		$div.hover( function( event ) {
			assert.ok( /mouseenter|mouseleave/.test( event.type ), event.type );
			$div.off( event );
		} ).trigger( "mouseenter" ).trigger( "mouseleave" );
	} );

	expectWarning( assert, ".hover() two-arg", 1, function() {
		$div.hover(
			function( event ) {
				assert.equal( "mouseenter", event.type, event.type );
			},
			function( event ) {
				assert.equal( "mouseleave", event.type, event.type );
			}
		).trigger( "mouseenter" ).trigger( "mouseleave" );
	} );
} );

QUnit.test( "custom ready", function( assert ) {
	assert.expect( 2 );

	jQuery("#qunit-fixture").append("<div id='foo'>bar</div>");

	expectNoWarning( assert, "Custom ready event not on document", 1, function() {
		jQuery( "#foo" ).on( "ready", function() {
			assert.ok( true, "custom ready event was triggered" );
		} )
		.trigger( "ready" )
		.off( "ready" );
	} );
} );

TestManager.runIframeTest( "document ready", "event-ready.html",
	function( assert, jQuery ) {
		assert.expect( 1 );

		assert.equal( jQuery.migrateWarnings.length, 1, "warnings: " +
			JSON.stringify( jQuery.migrateWarnings ) );
	} );

TestManager.runIframeTest( "jQuery.event.props.concat", "event-props-concat.html",
	function( assert, jQuery,  window, document, log, props ) {
		assert.expect( 3 );

		var warns = JSON.stringify( jQuery.migrateWarnings );

		assert.equal( jQuery.migrateWarnings.length, 1, "one warning" );
		assert.ok( warns.indexOf( "props.concat" ) >= 0, "warnings: " + warns );
		assert.equal( props[0], "TESTING", "used the empty props" )
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

TestManager.runIframeTest( "Load within a ready handler", "event-lateload.html",
	function( assert, jQuery, window, document, log ) {
		assert.expect( 2 );

		assert.equal( jQuery.migrateWarnings.length, 1, "warnings: " +
			JSON.stringify( jQuery.migrateWarnings ) );
		assert.ok( /load/.test( jQuery.migrateWarnings[ 0 ] ), "message ok" );
	} );


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

test( "ready event", function() {
	expect( 4 );

	expectWarning( "Setting a ready event", 1, function() {
		jQuery( document ).on( "ready", function() {
			ok( true, "ready event was triggered" );
		} )
		.trigger( "ready" )
		.off( "ready" );
	} );

	expectNoWarning( "Custom ready event not on document", 1, function() {
		jQuery( "#foo" ).on( "ready", function( e ) {
			ok( true, "custom ready event was triggered" );
		} )
		.trigger( "ready" )
		.off( "ready" );
	} );
} );


QUnit.module( "event" );

QUnit.test( ".bind() and .unbind()", function( assert ) {
	assert.expect( 3 );

	var $elem = jQuery( "<div />" ).appendTo( "#qunit-fixture" );

	expectMessage( assert, ".bind()", 1, function() {
		$elem
			.bind( "click", function() {
				assert.ok( true, "click fired" );
			} )
			.trigger( "click" );
	} );

	expectMessage( assert, ".unbind()", 1, function() {
		$elem
			.unbind( "click" )
			.trigger( "click" );
	} );
} );

QUnit.test( ".delegate() and .undelegate()", function( assert ) {
	assert.expect( 3 );

	var $div = jQuery( "<div />" ).appendTo( "#qunit-fixture" );

	jQuery( "<p />" ).appendTo( $div );

	expectMessage( assert, ".delegate()", 1, function() {
		$div
			.delegate( "p", "click", function() {
				assert.ok( true, "delegated click fired" );
			} )
			.find( "p" ).trigger( "click" );
	} );

	expectMessage( assert, ".undelegate()", 1, function() {
		$div
			.undelegate( "p", "click" )
			.find( "p" ).trigger( "click" );
	} );
} );

QUnit.test( "Event aliases", function( assert ) {
	assert.expect( 14 );

	var $div = jQuery( "<div />" );

	"scroll click submit keydown".split( " " ).forEach( function( name ) {
		expectMessage( assert, "." + name + "()", 2, function() {
			$div[ name ]( function( event ) {
				assert.equal( event.type, name, name );
				$div.off( event );
			} )[ name ]();
		} );
	} );

	expectMessage( assert, ".hover() one-arg", 1, function() {
		$div.hover( function( event ) {
			assert.ok( /mouseenter|mouseleave/.test( event.type ), event.type );
			$div.off( event );
		} ).trigger( "mouseenter" ).trigger( "mouseleave" );
	} );

	expectMessage( assert, ".hover() two-arg", 1, function() {
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

TestManager.runIframeTest( "Load within a ready handler", "event-lateload.html",
	function( assert, jQuery ) {
		assert.expect( 2 );

		assert.equal( jQuery.migrateMessages.length, 1, "warnings: " +
			JSON.stringify( jQuery.migrateMessages ) );
		assert.ok( /load/.test( jQuery.migrateMessages[ 0 ] ), "message ok" );
	} );

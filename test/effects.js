module( "effects" );

QUnit.test( "jQuery.easing", function( assert ) {
	assert.expect( 5 );

	jQuery.easing.test = function( p, n, firstNum, diff ) {
		assert.notEqual( p, undefined );
		assert.notEqual( n, undefined );
		assert.notEqual( firstNum, undefined );
		assert.notEqual( diff, undefined );
	};

	var div = jQuery( "<div>test</div>" );

	div.appendTo( "#qunit-fixture" );

	expectWarning( "easing", function() {
		div.animate( { width: 20 }, 10, "test" );
	} );
} );

// If the browser has requestAnimationFrame, jQuery won't touch fx.interval
if ( window.requestAnimationFrame ) {

QUnit.test( "jQuery.fx.interval - no warning on animations", function( assert ) {
	assert.expect( 1 );

	var start = assert.async();

	// Can't use expectNoWarning since this is async
	jQuery.migrateReset();
	jQuery( "<div />" )
		.appendTo( "#qunit-fixture" )
		.animate( { opacity: 0.5 }, 50, function() {
			assert.equal( jQuery.migrateWarnings.length, 0, "no warning" );
			start();
		} );
} );

QUnit.test( "jQuery.fx.interval - warning on user change", function( assert ) {
	assert.expect( 2 );

	var oldInterval;

	expectWarning( "read fx.interval", function() {
		oldInterval = jQuery.fx.interval;
	} );
	expectWarning( "write fx.interval", function() {
		jQuery.fx.interval = 13;
	} );

	jQuery.fx.interval = oldInterval;
} );

}

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

// Only rAF browsers implement the interval warning
QUnit.test( "jQuery.fx.interval - user change", function( assert ) {
	assert.expect( 3 );

	var oldInterval,
		warner = window.requestAnimationFrame ? expectWarning : expectNoWarning;

	assert.ok( true, "requestAnimationFrame is " +
		( window.requestAnimationFrame ? "present" : "absent" ) );
	warner( "read fx.interval", function() {
		oldInterval = jQuery.fx.interval;
	} );
	warner( "write fx.interval", function() {
		jQuery.fx.interval = 13;
	} );

	jQuery.fx.interval = oldInterval;
} );


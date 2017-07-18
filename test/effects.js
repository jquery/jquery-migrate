QUnit.module( "effects" );

QUnit.test( "jQuery.easing", function( assert ) {
	var lastP = false,
		easingCallCount = 0,
		animComplete = assert.async();

	assert.expect( 7 );

	jQuery.easing.test = function( p, n, firstNum, diff ) {

		// First frame of animation
		if ( easingCallCount === 0 ) {
			assert.equal( p, 0 );
			assert.notEqual( n, undefined );
			assert.notEqual( firstNum, undefined );
			assert.notEqual( diff, undefined );

		// Second frame of animation. (Only check once so we know how many assertions to expect.)
		} else if ( easingCallCount === 1 ) {
			assert.ok( p > 0 );

		}
		lastP = p;
		easingCallCount++;

		// Linear
		return p;
	};

	var div = jQuery( "<div>test</div>" );

	div.appendTo( "#qunit-fixture" );

	expectWarning( assert, "easing", function() {
		div.animate( { width: 20 }, {
			duration: 100,
			easing: "test",
			complete: function() {
				assert.equal( lastP, 1 );
				animComplete();
			}
		} );
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
	warner( assert, "read fx.interval", function() {
		oldInterval = jQuery.fx.interval;
	} );
	warner( assert, "write fx.interval", function() {
		jQuery.fx.interval = 13;
	} );

	jQuery.fx.interval = oldInterval;
} );

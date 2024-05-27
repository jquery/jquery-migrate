// Support jQuery slim which excludes the effects module
if ( jQuery.fx ) {

QUnit.module( "effects" );

QUnit.test( "jQuery.easing", function( assert ) {
	var lastP = -0.1,
		easingCallCount = 0,
		animComplete = assert.async();

	assert.expect( 4 );

	// Keep the unused arguments.
	// The number is important for the test.
	jQuery.easing.testOld = function( _p, _n, _firstNum, _diff ) {
		assert.ok( false, "should not have been called" );
	};

	jQuery.easing.testNew = function( p ) {
		if ( ++easingCallCount < 3 ) {
			if ( p === 0 && p === lastP ) {
				assert.ok( true, "p===0 called twice before jQuery 3.2.0" );
			} else {
				assert.ok( p > lastP, "called, percentage is increasing" );
				lastP = p;
			}
		}

		// Linear
		return p;
	};

	var div = jQuery( "<div>test</div>" )
			.css( "width", "30px" )
			.appendTo( "#qunit-fixture" );

	// Can't use expectWarning since this is async
	jQuery.migrateReset();
	div.animate( { width: "20px" }, {
		duration: 50,
		easing: "testOld",
		complete: function() {
			assert.equal( jQuery.migrateWarnings.length, 1, "warned" );
			jQuery.migrateWarnings.length = 0;
			div.animate( { width: "10px" }, {
				duration: 50,
				easing: "testNew",
				complete: function() {
					assert.equal( jQuery.migrateWarnings.length, 0, "did not warn" );
					animComplete();
				}
			} );
		}
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

}

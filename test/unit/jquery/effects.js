// Support jQuery slim which excludes the effects module
if ( jQuery.fx ) {

QUnit.module( "effects" );

// If the browser has requestAnimationFrame, jQuery won't touch fx.interval
QUnit.test( "jQuery.fx.interval - no warning on animations", function( assert ) {
	assert.expect( 1 );

	var start = assert.async();

	// Can't use expectNoMessage since this is async
	jQuery.migrateReset();
	jQuery( "<div />" )
		.appendTo( "#qunit-fixture" )
		.animate( { opacity: 0.5 }, 50, function() {
			assert.equal( jQuery.migrateMessages.length, 0, "no warning" );
			start();
		} );
} );

// Only rAF browsers implement the interval warning
QUnit.test( "jQuery.fx.interval - user change", function( assert ) {
	assert.expect( 3 );

	var oldInterval,
		warner = window.requestAnimationFrame ? expectMessage : expectNoMessage;

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

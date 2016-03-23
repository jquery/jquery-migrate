
module( "offset" );

QUnit.test( ".offset()", function( assert ) {
	expect( 8 );

	var bogus = { top: 0, left: 0 };

	expectNoWarning( ".offset() on body", function() {
		assert.ok( "top" in jQuery( "body" ).offset(), "got an offset object" );
	} );

	expectWarning( ".offset() on window", function() {
		assert.deepEqual(
			jQuery( window ).offset(),
			bogus, "window bogus top/left 0" );
	} );

	expectWarning( ".offset() on disconnected node", function() {
		assert.deepEqual(
			jQuery( document.createElement( "div" ) ).offset(),
			bogus, "disconnected bogus top/left 0" );
	} );

	expectWarning( ".offset() on plain object", function() {
		assert.deepEqual(
			jQuery( { space: "junk", zero: 0 } ).offset(),
			bogus, "plain object bogus top/left 0" );
	} );
} );

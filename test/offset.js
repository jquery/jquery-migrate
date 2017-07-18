
QUnit.module( "offset" );

QUnit.test( ".offset()", function( assert ) {
	assert.expect( 12 );

	var bogus = { top: 0, left: 0 };

	expectNoWarning( assert, ".offset() on body", function() {
		var offset = jQuery( "body" ).offset();

		assert.ok( offset.top > 1, "non-zero top offset" );
		assert.ok( offset.left > 1, "non-zero left offset" );
	} );

	expectNoWarning( assert, ".offset() as setter", function() {
		var $elem = jQuery( "<div />" )
				.appendTo( "#qunit-fixture" )
				.css( "position", "absolute" )
				.offset( { top: 42, left: 99 } ),
			offset = $elem.offset();

		assert.equal( offset.top, 42, "non-zero top offset" );
		assert.equal( offset.left, 99, "non-zero left offset" );
	} );

	expectWarning( assert, ".offset() on window", function() {
		assert.deepEqual(
			jQuery( window ).offset(),
			bogus, "window bogus top/left 0"
		);
	} );

	expectWarning( assert, ".offset() on disconnected node", function() {
		assert.deepEqual(
			jQuery( document.createElement( "div" ) ).offset(),
			bogus, "disconnected bogus top/left 0"
		);
	} );

	expectWarning( assert, ".offset() on plain object", function() {
		assert.deepEqual(
			jQuery( { space: "junk", zero: 0 } ).offset(),
			bogus, "plain object bogus top/left 0"
		);
	} );
} );

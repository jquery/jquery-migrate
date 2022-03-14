
QUnit.module( "offset" );

QUnit.test( ".offset()", function( assert ) {
	assert.expect( 21 );

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
		assert.strictEqual(
			jQuery( window ).offset(),
			undefined, "window undefined"
		);
	} );

	expectNoWarning( assert, ".offset() on disconnected node", function() {
		assert.deepEqual(
			jQuery( document.createElement( "div" ) ).offset(),
			bogus, "disconnected bogus top/left 0"
		);
	} );

	expectNoWarning( assert, ".offset() as setter on disconnected node",
			function() {
		var offset,
			$elemInitial = jQuery( "<div />" )
				.css( "position", "fixed" ),
			$elem = $elemInitial
				.offset( { top: 42, left: 99 } );

		assert.strictEqual( $elem[ 0 ], $elemInitial[ 0 ],
			".offset() returns a proper jQuery object" );

		$elem.appendTo( "#qunit-fixture" );
		offset = $elem.offset();
		assert.strictEqual( offset.top, 42, "proper top offset" );
		assert.strictEqual( offset.left, 99, "proper left offset" );
	} );

	expectNoWarning( assert, ".offset() on empty set", function() {
		var $empty = jQuery();

		assert.strictEqual( $empty.offset(), undefined, ".offset() returns undefined" );
		assert.strictEqual( $empty.offset( { top: 42, left: 99 } ), $empty,
			".offset( coords ) returns the jQuery object" );
	} );

	expectWarning( assert, ".offset() on plain object", function() {
		assert.strictEqual(
			jQuery( { space: "junk", zero: 0 } ).offset(),
			undefined, "plain object undefined"
		);
	} );

	expectNoWarning( assert, ".offset() on documentElement", function() {
		assert.deepEqual(
			jQuery( document.documentElement ).offset(),
			{ top: 0, left: 0 }, "no crash"
		);
	} );
} );

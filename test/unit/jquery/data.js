QUnit.module( "data" );

QUnit.test( "properties from Object.prototype", function( assert ) {
	assert.expect( 6 );

	var div = jQuery( "<div>" ).appendTo( "#qunit-fixture" );

	div.data( "foo", "bar" );

	expectNoMessage( assert, "Regular properties", function() {
		assert.strictEqual( div.data( "foo" ), "bar", "data access" );
		assert.strictEqual( jQuery.data( div[ 0 ], "foo" ), "bar", "data access (static method)" );
	} );

	expectMessage( assert, "Properties from Object.prototype", 2, function() {
		assert.ok( div.data().hasOwnProperty( "foo" ),
			"hasOwnProperty works" );
		assert.ok( jQuery.data( div[ 0 ] ).hasOwnProperty( "foo" ),
			"hasOwnProperty works (static method)" );
	} );
} );

QUnit.module( "data" );

QUnit.test( "properties from Object.prototype", function( assert ) {
	assert.expect( 8 );

	var div = jQuery( "<div>" ).appendTo( "#qunit-fixture" );

	div.data( "foo", "bar" );
	jQuery._data( div[ 0 ], "baz", "qaz" );

	expectNoMessage( assert, "Regular properties", function() {
		assert.strictEqual( div.data( "foo" ), "bar", "data access" );
		assert.strictEqual( jQuery.data( div[ 0 ], "foo" ), "bar", "data access (static method)" );
		assert.strictEqual( jQuery._data( div[ 0 ], "baz" ), "qaz", "private data access" );
	} );

	expectMessage( assert, "Properties from Object.prototype", 3, function() {
		assert.ok( div.data().hasOwnProperty( "foo" ),
			"hasOwnProperty works" );
		assert.ok( jQuery.data( div[ 0 ] ).hasOwnProperty( "foo" ),
			"hasOwnProperty works (static method)" );
		assert.ok( jQuery._data( div[ 0 ] ).hasOwnProperty( "baz" ),
			"hasOwnProperty works (private data)" );
	} );
} );

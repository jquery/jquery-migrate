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

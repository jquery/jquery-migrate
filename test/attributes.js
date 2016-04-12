
QUnit.module( "attributes" );

QUnit.test( ".removeAttr( boolean attribute )", function( assert ) {
	assert.expect( 8 );

	expectNoWarning( "non-boolean attr", function() {
		var $div = jQuery( "<div />" )
				.attr( "quack", "duck" )
				.removeAttr( "quack" );

		assert.equal( $div.attr( "quack" ), null, "non-boolean attribute was removed" );
		assert.equal( $div.prop( "quack" ), undefined, "property was not set" );
	} );

	expectWarning( "boolean attr", function() {
		var $inp = jQuery( "<input type=checkbox/>" )
				.attr( "checked", "checked" )
				.prop( "checked", true )
				.removeAttr( "checked" );

		assert.equal( $inp.attr( "checked" ), null, "boolean attribute was removed" );
		assert.equal( $inp.prop( "checked" ), false, "property was changed" );
	} );

	// One warning per attribute name
	expectWarning( "multiple boolean attr", 2, function() {
		jQuery( "<input type=checkbox/>" )
			.attr( "checked", "checked" )
			.attr( "readonly", "readonly" )
			.removeAttr( "checked readonly" );
	} );

	expectWarning( "mixed attr, one boolean", function() {
		jQuery( "<input />" )
			.attr( "type", "text" )
			.attr( "size", "15" )
			.attr( "disabled", "disabled" )
			.removeAttr( "disabled" )
			.removeAttr( "size" );
	} );

} );

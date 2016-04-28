
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

QUnit.test( "", function( assert ) {
	assert.expect( 13 );

	var e = jQuery( "<div />" ).appendTo( "#qunit-fixture" );

	expectWarning( "toggling initially empty class", function() {
		e.toggleClass( true );
		assert.equal( e[ 0 ].className, "", "Assert class is empty (data was empty)" );
	} );

	expectNoWarning( "toggleClass not full className", function() {
		e.attr( "class", "" );
		e.toggleClass( "classy" );
		assert.equal( e.attr( "class" ), "classy", "class was toggle-set" );
		e.toggleClass( "classy", false );
		assert.equal( e.attr( "class" ), "", "class was toggle-removed" );
	} );

	expectWarning( "toggleClass full-className manipulations", function() {
		e.addClass( "testD testE" );
		assert.ok( e.is( ".testD.testE" ), "Assert class present" );
		e.toggleClass();
		assert.ok( !e.is( ".testD.testE" ), "Assert class not present" );
		assert.equal( jQuery.data( e[ 0 ], "__className__" ), "testD testE", "Data was stored" );
		e.toggleClass();
		assert.ok( e.is( ".testD.testE" ), "Assert class present (restored from data)" );
		e.toggleClass( false );
		assert.ok( !e.is( ".testD.testE" ), "Assert class not present" );
		e.toggleClass( true );
		assert.ok( e.is( ".testD.testE" ), "Assert class present (restored from data)" );
		e.toggleClass();
		e.toggleClass( false );
		e.toggleClass();
		assert.ok( e.is( ".testD.testE" ), "Assert class present (restored from data)" );
	} );
} );

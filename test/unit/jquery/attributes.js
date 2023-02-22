
QUnit.module( "attributes" );

QUnit.test( ".removeAttr( boolean attribute )", function( assert ) {
	assert.expect( 14 );

	expectNoWarning( assert, "non-boolean attr", function() {
		var $div = jQuery( "<div />" )
				.attr( "quack", "duck" )
				.removeAttr( "quack" );

		assert.equal( $div.attr( "quack" ), null, "non-boolean attribute was removed" );
		assert.equal( $div.prop( "quack" ), undefined, "property was not set" );
	} );

	expectWarning( assert, "boolean attr", function() {
		var $inp = jQuery( "<input type=checkbox/>" )
				.attr( "checked", "checked" )
				.prop( "checked", true )
				.removeAttr( "checked" );

		assert.equal( $inp.attr( "checked" ), null, "boolean attribute was removed" );
		assert.equal( $inp.prop( "checked" ), false, "property was changed" );
	} );

	// One warning per attribute name
	expectWarning( assert, "multiple boolean attr", 2, function() {
		jQuery( "<input type=checkbox/>" )
			.attr( "checked", "checked" )
			.attr( "readonly", "readonly" )
			.removeAttr( "checked readonly" );
	} );

	expectWarning( assert, "mixed attr, one boolean", function() {
		jQuery( "<input />" )
			.attr( "type", "text" )
			.attr( "size", "15" )
			.attr( "disabled", "disabled" )
			.removeAttr( "disabled" )
			.removeAttr( "size" );
	} );

	expectNoWarning( assert, "boolean attr when prop false", function() {
		var $inp = jQuery( "<input type=checkbox/>" )
				.attr( "checked", "checked" )
				.prop( "checked", false )
				.removeAttr( "checked" );

		assert.equal( $inp.attr( "checked" ), null, "boolean attribute was removed" );
		assert.equal( $inp.prop( "checked" ), false, "property was not changed" );
	} );

	expectWarning( assert, "boolean attr when only some props false", 1, function() {
		var $inp = jQuery( "<input type=checkbox/><input type=checkbox/><input type=checkbox/>" )
				.attr( "checked", "checked" )
				.prop( "checked", false )
				.eq( 1 ).prop( "checked", true ).end()
				.removeAttr( "checked" );

		assert.equal( $inp.attr( "checked" ), null, "boolean attribute was removed" );
		assert.equal( $inp.eq( 1 ).prop( "checked" ), false, "property was changed" );
	} );
} );

QUnit.test( ".toggleClass( boolean )", function( assert ) {
	assert.expect( 14 );

	var e = jQuery( "<div />" ).appendTo( "#qunit-fixture" );

	expectWarning( assert, "toggling initially empty class", 1, function() {
		e.toggleClass( true );
		assert.equal( e[ 0 ].className, "", "Assert class is empty (data was empty)" );
	} );

	expectNoWarning( assert, ".toggleClass( string ) not full className", 1, function() {
		e.attr( "class", "" );
		e.toggleClass( "classy" );
		assert.equal( e.attr( "class" ), "classy", "class was toggle-set" );
		e.toggleClass( "classy", false );
		assert.equal( e.attr( "class" ), "", "class was toggle-removed" );
	} );

	expectWarning( assert, ".toggleClass() save and clear", 1, function() {
		e.addClass( "testD testE" );
		assert.ok( e.is( ".testD.testE" ), "Assert class present" );
		e.toggleClass();
		assert.ok( !e.is( ".testD.testE" ), "Assert class not present" );

		// N.B.: Store should have "testD testE" now, next test will assert that
	} );

	expectWarning( assert, ".toggleClass() restore", 1, function() {
		e.toggleClass();
		assert.ok( e.is( ".testD.testE" ), "Assert class present (restored from data)" );
	} );

	expectWarning( assert, ".toggleClass( boolean )", 5, function() {
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

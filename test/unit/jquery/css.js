
QUnit.module( "css" );

QUnit.test( "jQuery.swap()", function( assert ) {
	assert.expect( 6 );

	var div = document.createElement( "div" );
	div.style.borderWidth = "4px";

	expectWarning( assert, "External swap() call", function() {
		jQuery.swap( div, { borderRightWidth: "5px" }, function( arg ) {

			assert.equal( this.style.borderRightWidth, "5px", "style was changed" );
			assert.equal( arg, 42, "arg was passed" );

		}, [ 42 ] );
	} );
	assert.equal( div.style.borderRightWidth, "4px", "style was restored" );

	expectNoWarning( assert, "Internal swap() call", function() {
		var $fp = jQuery( "#firstp" ).width( "10em" ),
			width = $fp.width();

		assert.equal( $fp.hide().width(), width, "correct width" );
	} );

} );

QUnit[ ( jQueryVersionSince( "3.4.0" ) && typeof Proxy !== "undefined" ) ? "test" : "skip"
	]( "jQuery.cssProps", function( assert ) {
	assert.expect( 2 );

	expectWarning( assert, "Write to cssProps", function() {
		jQuery.cssProps.devoHat = "awesomeHat";
	} );

	expectNoWarning( assert, "Read from cssProps", function() {
		// eslint-disable-next-line no-unused-expressions
		jQuery.cssProps.devoHat;
		// eslint-disable-next-line no-unused-expressions
		jQuery.cssProps.unknownProp;
	} );

	delete jQuery.cssProps.devoHat;
} );

QUnit.test( "jQuery.css with arrays", function( assert ) {
	assert.expect( 2 );

	expectNoWarning( assert, "String value direct", function() {
		var cssValues = jQuery( "<div />" )
			.css( {
				"z-index": "2",
				fontSize: "16px"
			} )
			.css( [ "font-size", "zIndex" ] );

		assert.deepEqual( cssValues, { "font-size": "16px", zIndex: "2" },
			".css( array ) works" );
	} );
} );

QUnit[
	typeof Proxy !== "undefined" ? "test" : "skip"
]( "jQuery.css with numbers", function( assert ) {
	var jQuery3OrOlder = compareVersions( jQuery.fn.jquery, "4.0.0" ) < 0,
		allowlist = [
			"margin",
			"marginTop",
			"marginRight",
			"marginBottom",
			"marginLeft",
			"padding",
			"paddingTop",
			"paddingRight",
			"paddingBottom",
			"paddingLeft",
			"top",
			"right",
			"bottom",
			"left",
			"width",
			"height",
			"minWidth",
			"minHeight",
			"maxWidth",
			"maxHeight",
			"border",
			"borderWidth",
			"borderTop",
			"borderTopWidth",
			"borderRight",
			"borderRightWidth",
			"borderBottom",
			"borderBottomWidth",
			"borderLeft",
			"borderLeftWidth"
		];

	assert.expect( jQuery3OrOlder ?  8 : 7 );

	function kebabCase( string ) {
		return string.replace( /[A-Z]/g, function( match ) {
			return "-" + match.toLowerCase();
		} );
	}

	expectWarning( assert, "Number value direct", function() {
		jQuery( "<div />" ).css( "fake-property", 10 );
	} );

	expectWarning( assert, "Number in an object", 1, function() {
		jQuery( "<div />" ).css( {
			"width": 14,
			"height": "10px",
			"fake-property": 2
		} );
	} );

	expectNoWarning( assert, "String value direct", function() {
		jQuery( "<div />" ).css( "fake-property", "10px" );
	} );

	expectNoWarning( assert, "String in an object", function() {
		jQuery( "<div />" ).css( {
			"width": "14em",
			"height": "10px",
			"fake-property": "2"
		} );
	} );

	expectNoWarning( assert, "Number value (allowlisted props)", function() {
		allowlist.forEach( function( prop ) {
			jQuery( "<div />" ).css( prop, 1 );
			jQuery( "<div />" ).css( kebabCase( prop ), 1 );
		} );
	} );

	expectNoWarning( assert, "Props from jQuery.cssNumber", function() {
		var prop,
			assertionFired = false;
		for ( prop in jQuery.cssNumber ) {
			assertionFired = true;
			jQuery( "<div />" ).css( prop, 1 );
			jQuery( "<div />" ).css( kebabCase( prop ), 1 );
		}
		if ( jQuery3OrOlder ) {
			assert.strictEqual( assertionFired, true, "jQuery.cssNumber property was accessed" );
		}
	} );

	// z-index is tested explicitly as raw jQuery 4.0 will not have `jQuery.cssNumber`
	// so iterating over it won't find anything and we'd like to ensure number values
	// are not warned against for safe CSS props like z-index (gh-438).
	expectNoWarning( assert, "z-index", function() {
		jQuery( "<div />" ).css( "z-index", 1 );
		jQuery( "<div />" ).css( kebabCase( "zIndex" ), 1 );
	} );

} );

QUnit.test( "jQuery.cssNumber", function( assert ) {
	assert.expect( 1 );

	assert.ok( jQuery.cssNumber, "jQuery.cssNumber exists" );
} );

QUnit.test( "An unsupported jQuery.fn.css(Object,Number) signature", function( assert ) {
	assert.expect( 1 );
	assert.ok( ( jQuery( "<div/>" ).css( { left: "100%" }, 300 ), "No crash" ) );
} );

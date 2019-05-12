
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

QUnit[ ( jQueryVersionSince( "3.4.0" ) && typeof Proxy !== "undefined" ) ? "test" : "skip" ]
		( "jQuery.cssProps", function( assert ) {
	assert.expect( 2 );

	expectWarning( assert, "Write to cssProps", function() {
		jQuery.cssProps.devoHat = "awesomeHat";
	} );

	expectNoWarning( assert, "Read from cssProps", function() {
		jQuery.cssProps.devoHat;
		jQuery.cssProps.unknownProp;
	} );

	delete jQuery.cssProps.devoHat;
} );

QUnit.test( "jQuery.css with numbers", function( assert) {
	assert.expect( 4 );

	expectWarning( assert, "Number value direct", 1, function() {
		jQuery( "<div />" ).css( "height", 10 );
	} );

	expectWarning( assert, "Number in an object", 2, function() {
		jQuery( "<div />" ).css( {
			"width": 14,
			"height": "10px",
			"line-height": 2
		} );
	} );

	expectNoWarning( assert, "Number value direct", function() {
		jQuery( "<div />" ).css( "height", 10 );
	} );

	expectNoWarning( assert, "Number in an object", function() {
		jQuery( "<div />" ).css( {
			"width": "14em",
			"height": "10px",
			"line-height": "2"
		} );
	} );

} );

QUnit.test( "jQuery.cssNumber", function( assert) {
	assert.expect( 2 );

	expectWarning( assert, "Setting cssNumber value", 1, function() {
		jQuery.cssNumber.blart = true;
	} );


	expectWarning( assert, "Getting cssNumber value", function() {
		assert.ok( jQuery.cssNumber.blart, "blart was set" );
	} );

	delete jQuery.cssNumber.blart;

} );

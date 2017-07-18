
QUnit.module( "serialize" );

QUnit.test( "jQuery.param( x, traditional)", function( assert ) {
	assert.expect( 12 );

	var savedTraditional = jQuery.ajaxSettings.traditional,
		data = { a: [ 1, 2 ] },
		standardResult = "a%5B%5D=1&a%5B%5D=2",
		traditionalResult = "a=1&a=2";

	expectNoWarning( assert, "default, traditional default", function() {
		assert.equal(
			jQuery.param( data ), standardResult,
			"default, traditional default" );
	} );

	expectNoWarning( assert, "explicit true, traditional default", function() {
		assert.equal(
			jQuery.param( data, true ), traditionalResult,
			"explicit true, traditional default" );
	} );

	expectNoWarning( assert, "explicit false, traditional default", function() {
		assert.equal(
			jQuery.param( data, false ), standardResult,
			"explicit false, traditional default" );
	} );

	jQuery.ajaxSettings.traditional = true;

	expectWarning( assert, "default, traditional true", function() {
		assert.equal(
			jQuery.param( data ), traditionalResult,
			"default, traditional true" );
	} );

	expectNoWarning( assert, "explicit true, traditional true", function() {
		assert.equal(
			jQuery.param( data, true ), traditionalResult,
			"explicit true, traditional true" );
	} );

	expectNoWarning( assert, "explicit false, traditional true", function() {
		assert.equal(
			jQuery.param( data, false ), standardResult,
			"explicit false, traditional true" );
	} );

	jQuery.ajaxSettings.traditional = savedTraditional;
} );

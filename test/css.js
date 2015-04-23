
module("css");

test( "jQuery.swap()", function( assert ) {
	assert.expect( 6 );

	var div = document.createElement( "div" );
	div.style.borderWidth = "4px";

	expectWarning( "External swap() call", function() {
		jQuery.swap( div, { borderWidth: "5px" }, function( arg ) {

			assert.equal( this.style.borderWidth, "5px", "style was changed" );
			assert.equal( arg, 42, "arg was passed" );

		}, [ 42 ] );
	});
	assert.equal( div.style.borderWidth, "4px", "style was restored" );

	expectNoWarning( "Internal swap() call", function() {
		var $fp = jQuery( "#firstp" ).css( "width", "9px" ).hide();
		assert.equal( $fp.hide().width(), 9, "correct width" );
	});

});

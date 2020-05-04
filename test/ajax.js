// Support jQuery slim which excludes the ajax module
if ( jQuery.ajax ) {

QUnit.module( "ajax" );

QUnit.test( "jQuery.ajax() deprecations on jqXHR", function( assert ) {
	assert.expect( 3 );

	var done = assert.async();

	expectWarning( assert, ".success(), .error(), .compete() calls", 3, function() {

		jQuery.ajax( "/not-found.404" )
			.success( jQuery.noop )
			.error( function( jQXHR ) {

				// Local file errors returns 0, pretend it's a 404
				assert.equal( jQXHR.status || 404, 404, "ajax error" );
			} )
			.complete( function() {
				assert.ok( true, "ajax complete" );

				// Wait for expectWarning to complete
				setTimeout( done, 1 );
			} );
	} );

} );

}

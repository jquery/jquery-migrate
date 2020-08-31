// Support jQuery slim which excludes the ajax module
if ( jQuery.ajax ) {

QUnit.module( "ajax" );

QUnit.test( "jQuery.ajax() deprecations on jqXHR", function( assert ) {
	assert.expect( 3 );

	var done = assert.async();

	expectWarning( assert, ".success(), .error(), .compete() calls", 3, function() {

		return jQuery.ajax( url( "not-found.404" ) )
			.success( jQuery.noop )
			.error( function( jQXHR ) {

				// Local file errors returns 0, pretend it's a 404
				assert.equal( jQXHR.status || 404, 404, "ajax error" );
			} )
			.complete( function() {
				assert.ok( true, "ajax complete" );
			} )
			.catch( jQuery.noop );
	} ).then( function() {
		done();
	} );

} );

[ " - Same Domain", " - Cross Domain" ].forEach( function( label, crossDomain ) {

	// The JSON-to-JSONP auto-promotion behavior is gone in jQuery 4.0 and as
	// it has security implications, we don't want to restore the legacy behavior.
	QUnit[ jQueryVersionSince( "4.0.0" ) ? "skip" : "test" ](
			"jQuery.ajax() JSON-to-JSONP auto-promotion" + label, function( assert ) {

		assert.expect( 5 );

		var done = assert.async(),
			tests = [
				function() {
					return expectNoWarning( assert, "dataType: \"json\"",
						function() {
							return jQuery.ajax( {
								url: url( "data/null.json" ),
								crossDomain: crossDomain,
								dataType: "json"
							} ).catch( jQuery.noop );
						}
					);
				},

				function() {
					return expectWarning( assert, "dataType: \"json\", URL callback", 1,
						function() {
							return jQuery.ajax( {
								url: url( "data/null.json?callback=?" ),
								crossDomain: crossDomain,
								dataType: "json"
							} ).catch( jQuery.noop );
						}
					);
				},

				function() {
					return expectWarning( assert, "dataType: \"json\", data callback", 1,
						function() {
							return jQuery.ajax( {
								url: url( "data/null.json" ),
								crossDomain: crossDomain,
								data: "callback=?",
								dataType: "json"
							} ).catch( jQuery.noop );
						}
					);
				},

				function() {
					return expectNoWarning( assert, "dataType: \"jsonp\", URL callback",
						function() {
							return jQuery.ajax( {
								url: url( "data/null.json?callback=?" ),
								crossDomain: crossDomain,
								dataType: "jsonp"
							} ).catch( jQuery.noop );
						}
					);
				},

				function() {
					return expectNoWarning( assert, "dataType: \"jsonp\", data callback",
						function() {
							return jQuery.ajax( {
								url: url( "data/null.json" ),
								crossDomain: crossDomain,
								data: "callback=?",
								dataType: "jsonp"
							} ).catch( jQuery.noop );
						}
					);
				}
			];

		// Invoke tests sequentially as they're async and early tests could get warnings
		// from later ones.
		function run( tests ) {
			var test = tests[ 0 ];
			return test().then( function() {
				if ( tests.length > 1 ) {
					return run( tests.slice( 1 ) );
				}
			} );
		}

		run( tests )
			.then( function() {
				done();
			} );
	} );
} );

}

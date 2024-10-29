// Support jQuery slim which excludes the ajax module
if ( jQuery.ajax ) {

QUnit.module( "ajax" );

QUnit.test( "jQuery.ajax() deprecations on jqXHR", function( assert ) {
	assert.expect( 3 );

	var done = assert.async();

	expectWarning( assert, ".success(), .error(), .complete() calls", 3, function() {

		return jQuery.ajax( url( "not-found.404" ) )
			.success( jQuery.noop )
			.error( function( jQXHR ) {

				// Local file errors returns 0, pretend it's a 404
				assert.equal( jQXHR.status || 404, 404, "ajax error" );
			} )
			.complete( function() {
				assert.ok( true, "ajax complete" );
			} ).catch( jQuery.noop );
	} ).then( function() {
		done();
	} );

} );

[ " - Same Domain", " - Cross Domain" ].forEach( function( label, crossDomain ) {
	function runTests( options ) {
		var forceEnablePatch = ( options || {} ).forceEnablePatch || false;

		// Support: IE <10 only
		// IE 9 doesn't support CORS, skip cross-domain tests there.
		QUnit[
			document.documentMode < 10 && crossDomain ? "skip" : "test"
		]( "jQuery.ajax() JSON-to-JSONP auto-promotion" + label + (
			forceEnablePatch ? ", patch force-enabled" : ""
		), function( assert ) {

			assert.expect( 10 );

			if ( forceEnablePatch ) {
				jQuery.migrateEnablePatches( "jsonp-promotion" );
			}

			var done = assert.async(),
				patchEnabled = forceEnablePatch || !jQueryVersionSince( "4.0.0" ),
				tests = [
					function() {
						var testName = "dataType: \"json\"";
						return expectNoWarning( assert, testName, function() {
							return jQuery.ajax( {
								url: url( "null.json" ),
								context: { testName: testName },
								crossDomain: crossDomain,
								dataType: "json",
								jsonpCallback: "customJsonpCallback"
							} ).then( function() {
								assert.ok( true, this.testName + " (success)" );
							} ).catch( function() {
								assert.ok( false, this.testName + " (failure)" );
							} );
						} );
					},

					function() {
						var testName = "dataType: \"json\", URL callback";
						return expectWarning( assert, testName, patchEnabled ? 1 : 0, function() {
							return jQuery.ajax( {
								url: url( "jsonpScript.js?callback=?" ),
								context: { testName: testName },
								crossDomain: crossDomain,
								dataType: "json",
								jsonpCallback: "customJsonpCallback"
							} ).then( function() {
								assert.ok( patchEnabled, this.testName + " (success)" );
							} ).catch( function() {
								assert.ok( !patchEnabled, this.testName + " (failure)" );
							} );
						} );
					},

					function() {
						var testName = "dataType: \"json\", data callback";
						return expectWarning( assert, testName, patchEnabled ? 1 : 0, function() {
							return jQuery.ajax( {
								url: url( "jsonpScript.js" ),
								context: { testName: testName },
								crossDomain: crossDomain,
								data: "callback=?",
								dataType: "json",
								jsonpCallback: "customJsonpCallback"
							} ).then( function() {
								assert.ok( patchEnabled, this.testName + " (success)" );
							} ).catch( function() {
								assert.ok( !patchEnabled, this.testName + " (failure)" );
							} );
						} );
					},

					function() {
						var testName = "dataType: \"jsonp\", URL callback";
						return expectNoWarning( assert, testName, function() {
							return jQuery.ajax( {
								url: url( "jsonpScript.js?callback=?" ),
								context: { testName: testName },
								crossDomain: crossDomain,
								dataType: "jsonp",
								jsonpCallback: "customJsonpCallback"
							} ).then( function() {
								assert.ok( true, this.testName + " (success)" );
							} ).catch( function() {
								assert.ok( false, this.testName + " (failure)" );
							} );
						} );
					},

					function() {
						var testName = "dataType: \"jsonp\", data callback";
						return expectNoWarning( assert, testName, function() {
							return jQuery.ajax( {
								url: url( "jsonpScript.js" ),
								context: { testName: testName },
								crossDomain: crossDomain,
								data: "callback=?",
								dataType: "jsonp",
								jsonpCallback: "customJsonpCallback"
							} ).then( function() {
								assert.ok( true, this.testName + " (success)" );
							} ).catch( function() {
								assert.ok( false, this.testName + " (failure)" );
							} );
						} );
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
	}

	if ( jQueryVersionSince( "4.0.0" ) ) {

		// In jQuery 4+, this behavior is disabled by default for security
		// reasons, re-enable for this test, but test default behavior as well.
		runTests( { forceEnablePatch: true } );
		runTests( { forceEnablePatch: false } );
	} else {
		runTests();
	}
} );

TestManager.runIframeTest(
	"Re-use JSONP callback name (jQuery trac-8205)",
	"ajax-jsonp-callback-name.html",
	function( assert, jQuery, window, document, log,
		thisCallbackInWindow1, thisCallbackInWindow2,
		previousJsonpCallback, previousCallback,
		nextJsonpCallback, requestSucceeded, error ) {
	assert.expect( 7 );

	assert.ok( requestSucceeded,
		"JSONP shouldn't fail" +
		( error ? "; error: " + ( error && error.message || error ) : "" ) );
	assert.ok( !!previousCallback,
		"Previous `callback` passed from the iframe" );
	assert.ok(
		!!nextJsonpCallback,
		"Next `jsonpCallback` passed from the iframe"
	);

	assert.ok( thisCallbackInWindow1,
		"JSONP callback name is in the window" );
	assert.strictEqual(
		previousJsonpCallback,
		undefined,
		"jsonpCallback option is set back to default in callbacks"
	);
	assert.ok(
		!thisCallbackInWindow2,
		"JSONP callback name was removed from the window"
	);
	assert.strictEqual(
		nextJsonpCallback,
		previousCallback,
		"JSONP callback name is re-used"
	);
} );

}

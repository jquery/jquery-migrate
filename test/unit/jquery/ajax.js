// Support jQuery slim which excludes the ajax module
if ( jQuery.ajax ) {

QUnit.module( "ajax" );

[ " - Same Domain", " - Cross Domain" ].forEach( function( label, crossDomain ) {
	function runTests( options ) {
		var forceEnablePatch = ( options || {} ).forceEnablePatch || false;

		QUnit.test( "jQuery.ajax() JSON-to-JSONP auto-promotion" + label + (
			forceEnablePatch ? ", patch force-enabled" : ""
		), function( assert ) {

			assert.expect( 10 );

			if ( forceEnablePatch ) {
				jQuery.migrateEnablePatches( "jsonp-promotion" );
			}

			var done = assert.async(),
				tests = [
					function() {
						var testName = "dataType: \"json\"";
						return expectNoMessage( assert, testName, function() {
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
						return expectMessage( assert, testName, forceEnablePatch ? 1 : 0,
								function() {
							return jQuery.ajax( {
								url: url( "jsonpScript.js?callback=?" ),
								context: { testName: testName },
								crossDomain: crossDomain,
								dataType: "json",
								jsonpCallback: "customJsonpCallback"
							} ).then( function() {
								assert.ok( forceEnablePatch, this.testName + " (success)" );
							} ).catch( function() {
								assert.ok( !forceEnablePatch, this.testName + " (failure)" );
							} );
						} );
					},

					function() {
						var testName = "dataType: \"json\", data callback";
						return expectMessage( assert, testName, forceEnablePatch ? 1 : 0,
								function() {
							return jQuery.ajax( {
								url: url( "jsonpScript.js" ),
								context: { testName: testName },
								crossDomain: crossDomain,
								data: "callback=?",
								dataType: "json",
								jsonpCallback: "customJsonpCallback"
							} ).then( function() {
								assert.ok( forceEnablePatch, this.testName + " (success)" );
							} ).catch( function() {
								assert.ok( !forceEnablePatch, this.testName + " (failure)" );
							} );
						} );
					},

					function() {
						var testName = "dataType: \"jsonp\", URL callback";
						return expectNoMessage( assert, testName, function() {
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
						return expectNoMessage( assert, testName, function() {
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

	// In jQuery 4+, this behavior is disabled by default for security
	// reasons, re-enable for this test, but test default behavior as well.
	runTests( { forceEnablePatch: true } );
	runTests( { forceEnablePatch: false } );
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

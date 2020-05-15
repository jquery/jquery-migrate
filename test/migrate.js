/* exported expectWarning, expectNoWarning */

function expectWarning( assert, name, expected, fn ) {
	if ( !fn ) {
		fn = expected;
		expected = null;
	}
	jQuery.migrateReset();
	fn();

	// Special-case for 0 warnings expected
	if ( expected === 0 ) {
		assert.deepEqual( jQuery.migrateWarnings, [], name + ": did not warn" );

	// Simple numeric equality assertion for warnings matching an explicit count
	} else if ( expected && jQuery.migrateWarnings.length === expected ) {
		assert.equal( jQuery.migrateWarnings.length, expected, name + ": warned" );

	// Simple ok assertion when we saw at least one warning and weren't looking for an explict count
	} else if ( !expected && jQuery.migrateWarnings.length ) {
		assert.ok( true, name + ": warned" );

	// Failure; use deepEqual to show the warnings that *were* generated and the expectation
	} else {
		assert.deepEqual( jQuery.migrateWarnings,
			"<warnings: " + ( expected || "1+" ) + ">", name + ": warned"
		);
	}
}

function expectNoWarning( assert, name, expected, fn ) {

	// Expected is present only for signature compatibility with expectWarning
	return expectWarning( assert, name, 0, fn || expected );
}

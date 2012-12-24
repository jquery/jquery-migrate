
// Don't spew on in the console window when we build
if ( navigator.userAgent.indexOf("PhantomJS") >= 0 ) {
	jQuery.migrateMute = true;
}

function expectWarning( name, expected, fn ) {
	if ( !fn ) {
		fn = expected;
		expected = null;
	}
	jQuery.migrateReset();
	fn();

	if ( expected && jQuery.migrateWarnings.length === expected ) {
		equal( jQuery.migrateWarnings.length, expected, name + ": warned" );

	// falsy `expected` passes whenever at least one warning was generated
	} else if ( !expected && jQuery.migrateWarnings.length ) {
		ok( true, name + ": warned" );
	} else {
		deepEqual( jQuery.migrateWarnings, "<warnings: " + expected + ">", name + ": warned" );
	}
}

function expectNoWarning( name, expected, fn ) {
	// expected is present only for signature compatibility with expectWarning
	fn = fn || expected;
	jQuery.migrateReset();
	fn();
	deepEqual( jQuery.migrateWarnings, [], name + ": did not warn" );
}

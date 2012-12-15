
function expectWarning( name, expected, fn ) {
	if ( !fn ) {
		fn = expected;
		expected = null;
	}
	jQuery.compatReset();
	fn();

	if ( expected && jQuery.compatWarnings.length === expected ) {
		equal( jQuery.compatWarnings.length, expected, name + ": warned" );

	// falsy `expected` passes whenever at least one warning was generated
	} else if ( !expected && jQuery.compatWarnings.length ) {
		ok( true, name + ": warned" );
	} else {
		deepEqual( jQuery.compatWarnings, "<warnings: " + expected + ">", name + ": warned" );
	}
}

function expectNoWarning( name, expected, fn ) {
	// expected is present only for signature compatibility with expectWarning
	fn = fn || expected;
	jQuery.compatReset();
	fn();
	deepEqual( jQuery.compatWarnings, [], name + ": did not warn" );
}

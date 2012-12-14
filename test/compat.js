
function expectWarning( name, fn ) {
	jQuery.compatReset();
	fn();
	notEqual( jQuery.compatWarnings.length, 0, name + ": got a warning" );
}

function expectNoWarning( name, fn ) {
	jQuery.compatReset();
	fn();
	equal( jQuery.compatWarnings.length, 0, name + ": did not warn" );
}

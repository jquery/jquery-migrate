
module( "data", { setup: jQuery.compatReset });


test("jQuery.fn.data('events')", function() {
	expect( 7 );
	var warnLength = jQuery.compatWarnings.length,
		$foo = jQuery("#foo");

	equal( $foo.data("events"), undefined, "no events initially" );
	equal( jQuery.compatWarnings.length, warnLength, "no warning" );
	$foo.data("events", 42);
	equal( $foo.data("events"), 42, "got our own defined data" );
	equal( jQuery.compatWarnings.length, warnLength, "no warning" );
	$foo.removeData("events");
	equal( $foo.data("events"), undefined, "no events again" );
	$foo.on( "click", jQuery.noop );
	equal( typeof $foo.data("events"), "object", "got undocumented events object" );
	$foo.off( "click", jQuery.noop );
	equal( jQuery.compatWarnings.length, warnLength + 1, "jQuery.fn.data('events') warned" );
});

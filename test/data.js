
module("data");


test( "jQuery.fn.data('events')", function() {
	expect( 6 );

	var $foo = jQuery("#foo");

	expectNoWarning( "$.data('events')", function() {
		equal( $foo.data("events"), undefined, "no events initially" );
		$foo.data("events", 42);
		equal( $foo.data("events"), 42, "got our own defined data" );
		$foo.removeData("events");
		equal( $foo.data("events"), undefined, "no events again" );
	});
	expectWarning( "$.data('events')", function() {
		$foo.on( "click", jQuery.noop );
		equal( typeof $foo.data("events"), "object", "got undocumented events object" );
		$foo.off( "click", jQuery.noop );
	});
});

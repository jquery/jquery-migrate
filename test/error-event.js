
test("error() event method", function() {
	expect( 2 );

	jQuery("<img />")
		.error(function(){
			ok( true, "Triggered error event" );
		})
		.error()
		.trigger("error")
		.off("error")
		.error()
		.remove();
});

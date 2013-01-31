
module( "manipulation" );

test( "andSelf", function() {
	expect( 2 );

	expectWarning( "andSelf", function() {
		var $test = jQuery("<div>Beautiful<p>World</p></div>").find("p").andSelf();
		equal( $test.length, 2, "correct element count" );
	});
});

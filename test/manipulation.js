
module( "manipulation" );

test( "andSelf", function() {
	expect( 2 );

	expectWarning( "andSelf", function() {
		var $test = jQuery("<div>Beautiful<p>World</p></div>").find("p").andSelf();
		equal( $test.length, 2, "correct element count" );
	});
});

test( "jQuery.clean, #12392", function() {

	expect( 3 );

	var elems = jQuery.clean( [ "<div>test div</div>", "<p>test p</p>" ] );

	equal( elems[ 0 ].innerHTML, "test div", "Content should be preserved" );
	equal( elems[ 1 ].innerHTML, "test p", "Content should be preserved" );

	equal( jQuery.clean([ "<span><span>" ]).length, 1, "Incorrect html-strings should not break anything" );

});

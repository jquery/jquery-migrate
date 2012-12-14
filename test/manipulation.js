
module( "manipulation" );

test( "andSelf", function() {
	expect( 2 );

	expectWarning( "andSelf", function() {
		var $test = jQuery("<div>Beautiful<p>World</p></div>").find("p").andSelf();
		equal( $test.length, 2, "correct element count" );
	});
});

test( "buildFragment", function() {
	expect( 6 );

	var frag, div, html;

	frag = jQuery.buildFragment( [], [ document ] ).fragment;
	equal( frag.childNodes.length, 0, "empty frag is empty" );
	
	frag = jQuery.buildFragment( [ document.createElement( "b" ) ], [ document ] ).fragment;
	equal( frag.childNodes.length, 1, "frag from DOM element" );
	equal( frag.firstChild.nodeName.toLowerCase(), "b", "frag node is correct" );

	html = "<p>sue<em>bawls</em></p><div>cheese<em>balls</em></div>";
	frag = jQuery.buildFragment( [ html ], [ document ] ).fragment;
	equal( frag.childNodes.length, 2, "frag from HTML" );
	equal( frag.lastChild.nodeName.toLowerCase(), "div", "frag last node is correct" );
	div = document.createElement( "div" );
	div.appendChild( frag );
	equal( div.innerHTML.toLowerCase().replace( /[\s\n]+/, "" ), html, "frag html" );
	// Not checking for a warning, it won't occur when e.g. 1.7.2 is used
});

module( "manipulation", { setup: jQuery.compatReset });

test( "buildFragment", function() {
	expect( 7 );

	var frag, div, html,
		warnLength = jQuery.compatWarnings.length;

	frag = jQuery.buildFragment( [], document );
	equal( frag.childNodes.length, 0, "empty frag is empty" );
	
	frag = jQuery.buildFragment( [ document.createElement( "b" ) ], null );
	equal( frag.childNodes.length, 1, "frag from DOM element" );
	equal( frag.firstChild.nodeName.toLowerCase(), "b", "frag node is correct" );

	html = "<p>sue<em>bawls</em></p><div>cheese<em>balls</em></div>";
	frag = jQuery.buildFragment( [ html ] );
	equal( frag.childNodes.length, 2, "frag from HTML" );
	equal( frag.lastChild.nodeName.toLowerCase(), "div", "frag last node is correct" );
	div = document.createElement( "div" );
	div.appendChild( frag );
	equal( div.innerHTML.toLowerCase().replace( /[\s\n]+/, "" ), html, "frag html" );
	
	equal( warnLength + 1, jQuery.compatWarnings.length, "jQuery.buildFragment warned" );
});
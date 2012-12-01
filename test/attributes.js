test("attrFn test", function() {
	expect( 1 );

	ok( !!jQuery.attrFn, "attrFn present" );
});

test( "attr(jquery_method)", function() {
	expect( 10 );
	var $elem = jQuery("<div />"),
		elem = $elem[ 0 ],
		attrObj = {
			id: "attrs",
			width: 10,
			height: 10,
			offset: { top: 1, left: 1 },
			css: { paddingLeft: 1, paddingRight: 1, color: "red" }
		};

	// one at a time
	$elem.attr({ html: "foo" }, true );
	equal( elem.innerHTML, "foo", "html" );

	$elem.attr({ text: "bar" }, true );
	equal( elem.innerHTML, "bar", "text" );

	// Multiple attributes
	$elem.attr( attrObj, true );
	equal( elem.getAttribute("id"), "attrs", "id (attribute)" );
	if ( jQuery.fn.width ) {
		equal( elem.style.width, "10px", "width" );
		equal( elem.style.height, "10px", "height" );
	} else {
		equal( elem.getAttribute("width"), "10", "width (attribute)" );
		equal( elem.getAttribute("height"), "10", "height (attribute)" );
	}

	if ( jQuery.fn.offset ) {
		equal( elem.style.top, "1px", "offset:top" );
		equal( elem.style.left, "1px", "offset:left" );
	} else {
		equal( elem.getAttribute("offset"), "" + attrObj.offset, "offset (attribute)" );
		ok( true, "no jQuery.fn.offset" );
	}

	if ( jQuery.css ) {
		equal( elem.style.paddingLeft, "1px", "css:paddingLeft" );
		equal( elem.style.paddingRight, "1px", "css:paddingRight" );
		ok( /^(#ff0000|red)$/i.test( elem.style.color ), "css:color" );
	} else {
		equal( elem.getAttribute("css"), "" + attrObj.css, "css (attribute)" );
		ok( true, "no jQuery.css" );
		ok( true, "no jQuery.css" );
	}
});

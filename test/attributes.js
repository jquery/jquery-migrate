
module("attributes");

test( "attrFn test", function() {
	expect( 4 );
	
	( jQuery._definePropertyBroken ? expectNoWarning : expectWarning )( "attrFn", function() {
		ok( !!jQuery.attrFn, "attrFn present" );
		equal( jQuery.attrFn.quack, undefined, "can read values from attrFn" );
		jQuery.attrFn.quack = true;
		equal( jQuery.attrFn.quack, true, "can assign new values to attrFn" );
	});
});

test( "warn if changing an input or button", function() {
	expect( 3 );

	var $div = jQuery("<div />"),
		$input = jQuery("<input type=text />"),
		$button = jQuery("<button type=button>click</button>");

	expectNoWarning( "input type change", function() {
		$div.appendTo("#qunit-fixture").attr( "type", "fancy" );
	});

	expectWarning( "input type change", function() {
		try {
			$input.appendTo("#qunit-fixture").attr( "type", "checkbox" );
		} catch ( e ) { }
	});

	expectWarning( "button type change", function() {
		try {
			$button.appendTo("#qunit-fixture").attr( "type", "submit" );
		} catch ( e ) { }
	});
});

test( "attr(jquery_method)", function() {
	expect( 11 );
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
	expectWarning( ".attr(props, true)", function() {
		$elem.attr({ html: "foo" }, true );
		equal( elem.innerHTML, "foo", "html" );
	});

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

test( "attrHooks[\"value\"]", function() {
	expect( 16 );

	expectWarning( "input.attr('value')", 1, function() {
		var input = jQuery("<input/>");
		equal( input.attr("value"), "", "input.attr('value') returns initially empty property." );
		input[0].value = "foo";
		equal( input.attr("value"), "foo", "input.attr('value') returns property." );
	});

	expectWarning( "textarea.attr('value')", 1, function() {
		equal( jQuery("#area1").attr("value"), "foobar", "textarea.attr('value') returns property." );
	});

	expectWarning( ".attr('value', val)", 1, function() {
		var input = jQuery("#text1").attr( "value", "foo" );
		equal( input[0].getAttributeNode("value").value, "foo", ".attr('value', val) sets attribute." );
		equal( input[0].value, "foo", ".attr('value', val) sets property." );
	});

	expectNoWarning( "button.attr(...)", function() {
		var button = jQuery("#button");
		equal( button.attr("value"), undefined, "button.attr('value') returns attribute." );
		equal( button.attr( "value", "foo" ).attr("value"), "foo", "button.attr('value', val) sets attribute." );
		equal( button.html(), "Button", "button.attr('value') doesn't affect contents" );
	});

	expectWarning( "div.attr(...)", 2, function() {
		var div = jQuery("#foo");
		equal( div.attr("value"), undefined, "div.attr('value') returns attribute." );
		equal( div.attr( "value", "bar" ).attr("value"), "bar", "div.attr('value', val) sets attribute." );
		equal( div[0].value, "bar", "div.attr('value', val) sets property." );
	});
});

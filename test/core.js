
module( "core" );

test( "jQuery.migrateVersion", function( assert ) {
	assert.expect( 1 );

	assert.ok( /^\d+\.\d+\.[\w\-]+/.test( jQuery.migrateVersion ), "Version property" );
} );

test( "jQuery(html, props)", function() {
	expect( 3 );

	var $el = jQuery( "<input/>", { name: "name", val: "value", size: 42 } );

	equal( $el.attr( "name" ), "name", "Name attribute" );
	equal( $el.attr( "size" ),
		jQuery.isEmptyObject( jQuery.attrFn ) ? undefined : "42", "Size attribute" );
	equal( $el.val(), "value", "Call setter method" );
} );

test( "jQuery( '#' )", function() {
	expect( 2 );

	expectWarning( "Selector, through the jQuery constructor, nothing but hash", function() {
		var set = jQuery( "#" );
		equal( set.length, 0, "empty set" );
	} );
} );

test( "attribute selectors with naked '#'", function() {
	expect( 6 );

	// These are wrapped in try/catch because they throw on jQuery 1.12.0+

	expectWarning( "attribute equals", function() {
		try {
			jQuery( "a[href=#]" );
		} catch ( e ) {}
	} );

	expectWarning( "attribute contains", function() {
		try {
			jQuery( "link[rel*=#stuff]" );
		} catch ( e ) {}
	} );

	expectWarning( "attribute starts, with spaces", function() {
		try {
			jQuery( "a[href ^= #junk]" );
		} catch ( e ) {}
	} );

	expectWarning( "attribute equals, hash not starting", function() {
		try {
			jQuery( "a[href=space#junk]" );
		} catch ( e ) {}
	} );

	expectNoWarning( "attribute equals, with single quotes", function() {
		try {
			jQuery( "a[href='#junk']" );
		} catch ( e ) {}
	} );

	expectNoWarning( "attribute equals, with double quotes", function() {
		try {
			jQuery( "a[href=\"#junk\"]" );
		} catch ( e ) {}
	} );
} );

test( "XSS injection (leading hash)", function() {
	expect( 1 );

	var threw = false;

	try {
		jQuery( "#yeah<p>RIGHT</p>" );
	} catch ( e ) {
		threw = true;
	}

	equal( threw, true, "Throw on leading-hash HTML (treated as selector)" );
} );

test( "XSS injection (XSS via script tag)", function() {
	expect( 2 );

	var threw = false;
	window.XSS = false;
	try {
		jQuery( "#<script>window.XSS=true<" + "/script>" );
	} catch ( e ) {
		threw = true;
	}
	equal( threw, true, "Throw on leading-hash HTML (treated as selector)" );
	equal( window.XSS, false, "XSS" );
} );

test( "XSS injection (XSS with hash and leading space)", function() {
	expect( 2 );

	var threw = false;
	window.XSS = false;
	try {
		jQuery( " \n#<script>window.XSS=true<" + "/script>" );
	} catch ( e ) {
		threw = true;
	}
	equal( threw, true, "Throw on leading-hash HTML and space (treated as selector)" );
	equal( window.XSS, false, "XSS" );
} );

test( "XSS injection (XSS via onerror inline handler)", function() {
	expect( 2 );

	var threw = false;
	window.XSS = false;
	try {
		jQuery( "#<img src=haha onerror='window.XSS=true' />" );
	} catch ( e ) {
		threw = true;
	}
	equal( threw, true, "Throw on leading-hash HTML (treated as selector)" );
	stop();
	setTimeout( function() {
		equal( window.XSS, false, "XSS" );
		start();
	}, 1000 );
} );

test( "jQuery( '<element>' ) usable on detached elements (#128)", function() {
	expect( 1 );

	jQuery( "<a>" ).outerWidth();
	ok( true, "No crash when operating on detached elements with window" );
} );

test( ".size", function() {
    expect( 1 );

    expectWarning( "size", function() {
        jQuery( "<div />" ).size();
    } );
} );

test( "jQuery.parseJSON", function() {
    expect( 2 );

    expectWarning( "jQuery.parseJSON", function() {
		deepEqual(
			jQuery.parseJSON( "{\"a\":1}" ),
			{ a: 1 },
			"jQuery.parseJSON output"
		);
    } );
} );

test( "jQuery.unique", function( assert ) {
	assert.expect( 2 );

	expectWarning( "jQuery.unique", function() {
		var body = jQuery( "body" )[ 0 ],
			head = jQuery( "head" )[ 0 ];
		assert.deepEqual(
			jQuery.unique( [ body, head, body ] ),
			[ head, body ],
			"unique sorted" );
	} );
} );

test( "jQuery.expr.pseudos aliases", function( assert ) {
	assert.expect( 7 );

	expectWarning( "jQuery.expr.filters", function() {
		jQuery.expr.filters.mazda = function( elem ) {
			return elem.style.zoom === "3";
		};
	} );

	expectWarning( "jQuery.expr[':']", function() {
		jQuery.expr[ ":" ].marginal = function( elem ) {
			return parseInt( elem.style.marginLeftWidth ) > 20;
		};
	} );

	expectNoWarning( "jQuery.expr.pseudos", function() {
		var fixture = jQuery( "#qunit-fixture" ).prepend( "<p>hello</p>" );

		assert.ok( jQuery.expr.pseudos.mazda, "filters assigned" );
		assert.ok( jQuery.expr.pseudos.marginal, "[':'] assigned" );
		fixture.find( "p" ).first().css( "marginLeftWidth", "40px" );
		assert.equal( fixture.find( "p:marginal" ).length, 1, "One marginal element" );
		assert.equal( fixture.find( "div:mazda" ).length, 0, "No mazda elements" );
		delete jQuery.expr.pseudos.mazda;
		delete jQuery.expr.pseudos.marginal;
	} );

} );

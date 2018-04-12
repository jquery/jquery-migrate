
QUnit.module( "core" );

QUnit.test( "jQuery.migrateVersion", function( assert ) {
	assert.expect( 1 );

	assert.ok( /^\d+\.\d+\.[\w\-]+/.test( jQuery.migrateVersion ), "Version property" );
} );

QUnit.test( "compareVersions and jQueryVersionSince", function( assert ) {
	assert.expect( 9 );

	assert.equal( compareVersions( "3.0.1", "3.0.0" ), 1, "greater than 1" );
	assert.equal( compareVersions( "3.0.1", "2.10.0" ), 1, "greater than 2" );
	assert.equal( compareVersions( "3.2.1", "3.3.0" ), -1, "less than 1" );
	assert.equal( compareVersions( "3.2.1", "4.1.3" ), -1, "less than 2" );
	assert.equal( compareVersions( "3.2.2", "3.11.1" ), -1, "less than 3");
	assert.equal( compareVersions( "3.4.1", "3.4.1" ), 0, "equal" );


	// Test against live jQuery version with suitably generous comparisons
	assert.equal( jQueryVersionSince( "1.4.2" ), true, "since - past version" );
	assert.equal( jQueryVersionSince( "8.0.3" ), false, "since - future version" );
	assert.equal( jQueryVersionSince( jQuery.fn.jquery ), true, "since - equal" );
} );

QUnit.test( "jQuery(html, props)", function( assert ) {
	assert.expect( 3 );

	var $el = jQuery( "<input/>", { name: "name", val: "value", size: 42 } );

	assert.equal( $el.attr( "name" ), "name", "Name attribute" );
	assert.equal( $el.attr( "size" ),
		jQuery.isEmptyObject( jQuery.attrFn ) ? undefined : "42", "Size attribute" );
	assert.equal( $el.val(), "value", "Call setter method" );
} );

QUnit.test( "jQuery( '#' )", function( assert ) {
	assert.expect( 2 );

	expectWarning( assert, "Selector, through the jQuery constructor, nothing but hash", function() {
		var set = jQuery( "#" );
		assert.equal( set.length, 0, "empty set" );
	} );
} );

QUnit.test( "Attribute selectors with unquoted hashes", function( assert ) {
	assert.expect( 31 );

	var markup = jQuery(
			"<div>" +
				"<div data-selector='a[href=#main]'></div>" +
				"<a href='space#junk'>test</a>" +
				"<link rel='good#stuff' />" +
				"<p class='space #junk'>" +
					"<a href='#some-anchor'>anchor2</a>" +
					"<input value='[strange*=#stuff]' />" +
					"<a href='#' data-id='#junk'>anchor</a>" +
				"</p>" +
			"</div>" ).appendTo( "#qunit-fixture" ),

		// No warning, no need to fix
		okays = [
			"a[href='#some-anchor']",
			"[data-id=\"#junk\"]",
			"div[data-selector='a[href=#main]']",
			"input[value~= '[strange*=#stuff]']"
		],

		// Fixable, and gives warning
		fixables = [
			"a[href=#]",
			"a[href*=#]:not([href=#]):first-child",
			".space a[href=#]",
			"a[href=#some-anchor]",
			"link[rel*=#stuff]",
			"p[class *= #junk]",
			"a[href=space#junk]"
		],

		// False positives that still work
		positives = [
			"div[data-selector='a[href=#main]']:first",
			"input[value= '[strange*=#stuff]']:eq(0)"
		],

		// Failures due to quotes and jQuery extensions combined
		failures = [
			"p[class ^= #junk]:first",
			"a[href=space#junk]:eq(1)"
		];

	expectNoWarning( assert, "Perfectly cromulent selectors are unchanged", function() {
		okays.forEach( function( okay ) {
			assert.equal( jQuery( okay, markup ).length, 1, okay );
			assert.equal( markup.find( okay ).length, 1, okay );
		} );
	} );

	expectWarning( assert, "Values with unquoted hashes are quoted", fixables.length, function() {
		fixables.forEach( function( fixable ) {
			assert.equal( jQuery( fixable, markup ).length, 1, fixable );
			assert.equal( markup.find( fixable ).length, 1, fixable );
		} );
	} );

	expectWarning( assert, "False positives", positives.length, function() {
		positives.forEach( function( positive ) {
			assert.equal( jQuery( positive, markup ).length, 1,  positive );
			assert.equal( markup.find( positive ).length, 1, positive );
		} );
	} );

	expectWarning( assert, "Unfixable cases", failures.length, function() {
		failures.forEach( function( failure ) {
			try {
				jQuery( failure, markup );
				assert.ok( false, "Expected jQuery() to die!" );
			} catch ( err1 ) { }
			try {
				markup.find( failure );
				assert.ok( false, "Expected .find() to die!" );
			} catch ( err2 ) { }
		} );
	} );

	// Ensure we don't process jQuery( x ) when x is a function
	expectNoWarning( assert, "ready function with attribute selector", function() {
		try {
			jQuery( function() {
				if ( jQuery.thisIsNeverTrue ) {
					jQuery( "a[href=#]" );
				}
			} );
		} catch ( e ) {}
	} );
} );

QUnit.test( "XSS injection (leading hash)", function( assert ) {
	assert.expect( 1 );

	var threw = false;

	try {
		jQuery( "#yeah<p>RIGHT</p>" );
	} catch ( e ) {
		threw = true;
	}

	assert.equal( threw, true, "Throw on leading-hash HTML (treated as selector)" );
} );

QUnit.test( "XSS injection (XSS via script tag)", function( assert ) {
	assert.expect( 2 );

	var threw = false;
	window.XSS = false;
	try {
		jQuery( "#<script>window.XSS=true<" + "/script>" );
	} catch ( e ) {
		threw = true;
	}
	assert.equal( threw, true, "Throw on leading-hash HTML (treated as selector)" );
	assert.equal( window.XSS, false, "XSS" );
} );

QUnit.test( "XSS injection (XSS with hash and leading space)", function( assert ) {
	assert.expect( 2 );

	var threw = false;
	window.XSS = false;
	try {
		jQuery( " \n#<script>window.XSS=true<" + "/script>" );
	} catch ( e ) {
		threw = true;
	}
	assert.equal( threw, true, "Throw on leading-hash HTML and space (treated as selector)" );
	assert.equal( window.XSS, false, "XSS" );
} );

QUnit.test( "XSS injection (XSS via onerror inline handler)", function( assert ) {
	assert.expect( 2 );

	var start,
		threw = false;

	window.XSS = false;
	try {
		jQuery( "#<img src=haha onerror='window.XSS=true' />" );
	} catch ( e ) {
		threw = true;
	}
	assert.equal( threw, true, "Throw on leading-hash HTML (treated as selector)" );

	start = assert.async();
	setTimeout( function() {
		assert.equal( window.XSS, false, "XSS" );
		start();
	}, 1000 );
} );

QUnit.test( "jQuery( '<element>' ) usable on detached elements (#128)", function( assert ) {
	assert.expect( 1 );

	jQuery( "<a>" ).outerWidth();
	assert.ok( true, "No crash when operating on detached elements with window" );
} );

QUnit.test( ".size", function( assert ) {
    assert.expect( 1 );

    expectWarning( assert, "size", function() {
        jQuery( "<div />" ).size();
    } );
} );

QUnit.test( "jQuery.parseJSON", function( assert ) {
    assert.expect( 2 );

    expectWarning( assert, "jQuery.parseJSON", function() {
		assert.deepEqual(
			jQuery.parseJSON( "{\"a\":1}" ),
			{ a: 1 },
			"jQuery.parseJSON output"
		);
    } );
} );

QUnit.test( "jQuery.isNumeric", function( assert ) {
    assert.expect( 8 );

	var ToString = function( value ) {
			this.toString = function() {
				return String( value );
			};
		};

    expectWarning( assert, "changed cases", function() {
		assert.equal( jQuery.isNumeric( new ToString( "42" ) ), true,
			"Custom .toString returning number" );
    } );

    expectNoWarning( assert, "unchanged cases", function() {
		assert.equal( jQuery.isNumeric( 42 ), true, "number" );
		assert.equal( jQuery.isNumeric( "42" ), true, "number string" );
		assert.equal( jQuery.isNumeric( "devo" ), false, "non-numeric string" );
		assert.equal( jQuery.isNumeric( [ 2, 4 ] ), false, "array" );
		assert.equal( jQuery.isNumeric( new ToString( "devo" ) ), false,
			"Custom .toString returning non-number" );
	} );
} );

QUnit[ jQueryVersionSince( "3.3.0" ) ? "test" : "skip" ]( "jQuery.isWindow", function( assert ) {
	assert.expect( 3 );

	expectWarning( assert, "isWindow", 1, function() {
		assert.equal( jQuery.isWindow( [] ), false, "array" );
		assert.equal( jQuery.isWindow( window ), true, "window" );
	} );
} );

QUnit.test( "jQuery.unique", function( assert ) {
	assert.expect( 2 );

	expectWarning( assert, "jQuery.unique", function() {
		var body = jQuery( "body" )[ 0 ],
			head = jQuery( "head" )[ 0 ];
		assert.deepEqual(
			jQuery.unique( [ body, head, body ] ),
			[ head, body ],
			"unique sorted" );
	} );
} );

QUnit.test( "jQuery.expr.pseudos aliases", function( assert ) {
	assert.expect( 7 );

	expectWarning( assert, "jQuery.expr.filters", function() {
		jQuery.expr.filters.mazda = function( elem ) {
			return elem.style.zoom === "3";
		};
	} );

	expectWarning( assert, "jQuery.expr[':']", function() {
		jQuery.expr[ ":" ].marginal = function( elem ) {
			return parseInt( elem.style.marginLeftWidth ) > 20;
		};
	} );

	expectNoWarning( assert, "jQuery.expr.pseudos", function() {
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

QUnit.test( "jQuery.holdReady (warn only)", function( assert ) {
	assert.expect( 1 );

	expectWarning( assert, "jQuery.holdReady", 1, function() {
		jQuery.holdReady( true );
		jQuery.holdReady( false );
	} );
} );

QUnit[ jQueryVersionSince( "3.2.0" ) ? "test" : "skip" ]( "jQuery.nodeName", function( assert ) {
	assert.expect( 2 );

	expectWarning( assert, "jQuery.nodeName", function() {
		var div = document.createElement( "div" );

		assert.equal( jQuery.nodeName( div, "div" ), true, "it's a div" );
	})
});

TestManager.runIframeTest( "old pre-3.0 jQuery", "core-jquery2.html",
	function( assert, jQuery, window, document, log ) {
		assert.expect( 1 );

		assert.ok( /jQuery 3/.test( log ), "logged: " + log );
	} );

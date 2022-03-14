
QUnit.module( "core" );

QUnit.test( "jQuery(html, props)", function( assert ) {
	assert.expect( 2 );

	var $el = jQuery( "<input/>", { name: "name", val: "value" } );

	assert.equal( $el.attr( "name" ), "name", "Name attribute" );
	assert.equal( $el.val(), "value", "Call setter method" );
} );

QUnit.test( "jQuery( '#' )", function( assert ) {
	assert.expect( 2 );

	expectWarning( assert, "Selector, through the jQuery constructor, nothing but hash",
			function() {
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

	expectWarning( assert, "Values with unquoted hashes are quoted",
			fixables.length * 2, function() {
		fixables.forEach( function( fixable ) {
			assert.equal( jQuery( fixable, markup ).length, 1, fixable );
			assert.equal( markup.find( fixable ).length, 1, fixable );
		} );
	} );

	expectWarning( assert, "False positives", positives.length * 2, function() {
		positives.forEach( function( positive ) {
			assert.equal( jQuery( positive, markup ).length, 1,  positive );
			assert.equal( markup.find( positive ).length, 1, positive );
		} );
	} );

	expectWarning( assert, "Unfixable cases", failures.length * 2, function() {
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

QUnit.test( "isNumeric", function( assert ) {
	assert.expect( 43 );

	var t = jQuery.isNumeric,
		ToString = function( value ) {
			this.toString = function() {
				return String( value );
			};
		};

	assert.ok( t( "-10" ), "Negative integer string" );
	assert.ok( t( "0" ), "Zero string" );
	assert.ok( t( "5" ), "Positive integer string" );
	assert.ok( t( -16 ), "Negative integer number" );
	assert.ok( t( 0 ), "Zero integer number" );
	assert.ok( t( 32 ), "Positive integer number" );
	assert.ok( t( "-1.6" ), "Negative floating point string" );
	assert.ok( t( "4.536" ), "Positive floating point string" );
	assert.ok( t( -2.6 ), "Negative floating point number" );
	assert.ok( t( 3.1415 ), "Positive floating point number" );
	assert.ok( t( 1.5999999999999999 ), "Very precise floating point number" );
	assert.ok( t( 8e5 ), "Exponential notation" );
	assert.ok( t( "123e-2" ), "Exponential notation string" );
	assert.ok( t( "040" ), "Legacy octal integer literal string" );
	assert.ok( t( "0xFF" ), "Hexadecimal integer literal string (0x...)" );
	assert.ok( t( "0Xba" ), "Hexadecimal integer literal string (0X...)" );
	assert.ok( t( 0xFFF ), "Hexadecimal integer literal" );

	if ( +"0b1" === 1 ) {
		assert.ok( t( "0b111110" ), "Binary integer literal string (0b...)" );
		assert.ok( t( "0B111110" ), "Binary integer literal string (0B...)" );
	} else {
		assert.ok( true, "Browser does not support binary integer literal (0b...)" );
		assert.ok( true, "Browser does not support binary integer literal (0B...)" );
	}

	if ( +"0o1" === 1 ) {
		assert.ok( t( "0o76" ), "Octal integer literal string (0o...)" );
		assert.ok( t( "0O76" ), "Octal integer literal string (0O...)" );
	} else {
		assert.ok( true, "Browser does not support octal integer literal (0o...)" );
		assert.ok( true, "Browser does not support octal integer literal (0O...)" );
	}

	assert.equal( t( new ToString( "42" ) ), false, "Only limited to strings and numbers" );
	assert.equal( t( "" ), false, "Empty string" );
	assert.equal( t( "        " ), false, "Whitespace characters string" );
	assert.equal( t( "\t\t" ), false, "Tab characters string" );
	assert.equal( t( "abcdefghijklm1234567890" ), false, "Alphanumeric character string" );
	assert.equal( t( "xabcdefx" ), false, "Non-numeric character string" );
	assert.equal( t( true ), false, "Boolean true literal" );
	assert.equal( t( false ), false, "Boolean false literal" );
	assert.equal( t( "bcfed5.2" ), false, "Number with preceding non-numeric characters" );
	assert.equal( t( "7.2acdgs" ), false, "Number with trailing non-numeric characters" );
	assert.equal( t( undefined ), false, "Undefined value" );
	assert.equal( t( null ), false, "Null value" );
	assert.equal( t( NaN ), false, "NaN value" );
	assert.equal( t( Infinity ), false, "Infinity primitive" );
	assert.equal( t( Number.POSITIVE_INFINITY ), false, "Positive Infinity" );
	assert.equal( t( Number.NEGATIVE_INFINITY ), false, "Negative Infinity" );
	assert.equal( t( new ToString( "Devo" ) ), false, "Custom .toString returning non-number" );
	assert.equal( t( {} ), false, "Empty object" );
	assert.equal( t( [] ), false, "Empty array" );
	assert.equal( t( [ 42 ] ), false, "Array with one number" );
	assert.equal( t( function() {} ), false, "Instance of a function" );
	assert.equal( t( new Date() ), false, "Instance of a Date" );
} );

QUnit[ typeof Symbol === "function" ? "test" : "skip" ]( "isNumeric(Symbol)", function( assert ) {
	assert.expect( 2 );

	assert.equal( jQuery.isNumeric( Symbol() ), false, "Symbol" );
	assert.equal( jQuery.isNumeric( Object( Symbol() ) ), false, "Symbol inside an object" );
} );

QUnit[ jQueryVersionSince( "3.3.0" ) ? "test" : "skip" ]( ".isNumeric (warn)", function( assert ) {
    assert.expect( 3 );

    expectWarning( assert, "warning on isNumeric (and possibly type)", function() {
		assert.equal( jQuery.isNumeric( 42 ), true, "isNumeric number" );
		assert.equal( jQuery.isNumeric( "nope" ), false, "isNumeric non number" );
    } );
} );

QUnit[ jQueryVersionSince( "3.3.0" ) ? "test" : "skip" ]( "jQuery.isWindow", function( assert ) {
	assert.expect( 3 );

	expectWarning( assert, "isWindow", 2, function() {
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

	expectWarning( assert, "jQuery.holdReady", 2, function() {
		jQuery.holdReady( true );
		jQuery.holdReady( false );
	} );
} );

QUnit[ jQueryVersionSince( "3.1.1" ) ? "test" : "skip" ]( "jQuery.trim", function( assert ) {
	assert.expect( 14 );

	var nbsp = String.fromCharCode( 160 );

	expectWarning( assert, "jQuery.trim", 13, function() {
		assert.equal( jQuery.trim( "hello  " ), "hello", "trailing space" );
		assert.equal( jQuery.trim( "  hello" ), "hello", "leading space" );
		assert.equal( jQuery.trim( "  hello   " ), "hello", "space on both sides" );
		assert.equal( jQuery.trim( "  " + nbsp + "hello  " + nbsp + " " ), "hello", "&nbsp;" );

		assert.equal( jQuery.trim(), "", "Nothing in." );
		assert.equal( jQuery.trim( undefined ), "", "Undefined" );
		assert.equal( jQuery.trim( null ), "", "Null" );
		assert.equal( jQuery.trim( 5 ), "5", "Number" );
		assert.equal( jQuery.trim( false ), "false", "Boolean" );

		assert.equal( jQuery.trim( " " ), "", "space should be trimmed" );
		assert.equal( jQuery.trim( "ipad\xA0" ), "ipad", "nbsp should be trimmed" );
		assert.equal( jQuery.trim( "\uFEFF" ), "", "zwsp should be trimmed" );
		assert.equal( jQuery.trim( "\uFEFF \xA0! | \uFEFF" ), "! |",
			"leading/trailing should be trimmed" );
	} );
} );

QUnit[ jQueryVersionSince( "3.2.0" ) ? "test" : "skip" ]( "jQuery.nodeName", function( assert ) {
	assert.expect( 2 );

	expectWarning( assert, "jQuery.nodeName", function() {
		var div = document.createElement( "div" );

		assert.equal( jQuery.nodeName( div, "div" ), true, "it's a div" );
	} );
} );

QUnit[ jQueryVersionSince( "3.3.0" ) ? "test" : "skip" ]( "jQuery.isFunction", function( assert ) {
	assert.expect( 4 );

	expectWarning( assert, "jQuery.isFunction", function() {
		assert.equal( jQuery.isFunction( function() {} ), true, "function is function" );
		assert.equal( jQuery.isFunction( {} ), false, "object not function" );
		assert.equal( jQuery.isFunction( 1 ), false, "number not function" );
	} );
} );

QUnit[ jQueryVersionSince( "3.3.0" ) ? "test" : "skip" ]( "jQuery.type (warn)", function( assert ) {
	assert.expect( 28 );

	assert.equal( jQuery.type( null ), "null", "null" );
	assert.equal( jQuery.type( undefined ), "undefined", "undefined" );
	assert.equal( jQuery.type( true ), "boolean", "Boolean" );
	assert.equal( jQuery.type( false ), "boolean", "Boolean" );
	assert.equal( jQuery.type( Boolean( true ) ), "boolean", "Boolean" );
	assert.equal( jQuery.type( 0 ), "number", "Number" );
	assert.equal( jQuery.type( 1 ), "number", "Number" );
	assert.equal( jQuery.type( Number( 1 ) ), "number", "Number" );
	assert.equal( jQuery.type( "" ), "string", "String" );
	assert.equal( jQuery.type( "a" ), "string", "String" );
	assert.equal( jQuery.type( String( "a" ) ), "string", "String" );
	assert.equal( jQuery.type( {} ), "object", "Object" );
	assert.equal( jQuery.type( /foo/ ), "regexp", "RegExp" );
	assert.equal( jQuery.type( new RegExp( "asdf" ) ), "regexp", "RegExp" );
	assert.equal( jQuery.type( [ 1 ] ), "array", "Array" );
	assert.equal( jQuery.type( new Date() ), "date", "Date" );
	assert.equal( jQuery.type( new Function( "return;" ) ), "function", "Function" );
	assert.equal( jQuery.type( function() {} ), "function", "Function" );
	assert.equal( jQuery.type( new Error() ), "error", "Error" );
	assert.equal( jQuery.type( window ), "object", "Window" );
	assert.equal( jQuery.type( document ), "object", "Document" );
	assert.equal( jQuery.type( document.body ), "object", "Element" );
	assert.equal( jQuery.type( document.createTextNode( "foo" ) ), "object", "TextNode" );
	assert.equal( jQuery.type( document.getElementsByTagName( "*" ) ), "object", "NodeList" );

	// Avoid Lint complaints
	var MyString = String,
		MyNumber = Number,
		MyBoolean = Boolean,
		MyObject = Object;
	assert.equal( jQuery.type( new MyBoolean( true ) ), "boolean", "Boolean" );
	assert.equal( jQuery.type( new MyNumber( 1 ) ), "number", "Number" );
	assert.equal( jQuery.type( new MyString( "a" ) ), "string", "String" );
	assert.equal( jQuery.type( new MyObject() ), "object", "Object" );

} );

QUnit[ jQueryVersionSince( "3.2.0" ) ? "test" : "skip" ]( "jQuery.isArray", function( assert ) {
	assert.expect( 4 );

	expectWarning( assert, "isArray", 3, function() {
		assert.equal( jQuery.isArray( [] ), true, "empty array" );
		assert.equal( jQuery.isArray( "" ), false, "empty string" );
		assert.equal( jQuery.isArray( jQuery().toArray() ), true, "toArray" );
	} );

} );

TestManager.runIframeTest( "old pre-3.0 jQuery", "core-jquery2.html",
	function( assert, jQuery, window, document, log ) {
		assert.expect( 1 );

		assert.ok( /jQuery 3/.test( log ), "logged: " + log );
} );


QUnit.module( "core" );

function getTagNames( elem ) {
	return elem.toArray().map( function( node ) {
		return node.tagName.toLowerCase();
	} );
}

QUnit.test( "jQuery(html, props)", function( assert ) {
	assert.expect( 2 );

	var $el = jQuery( "<input/>", { name: "name", val: "value" } );

	assert.equal( $el.attr( "name" ), "name", "Name attribute" );
	assert.equal( $el.val(), "value", "Call setter method" );
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

QUnit.test( "jQuery.parseJSON", function( assert ) {
    assert.expect( 2 );

    expectMessage( assert, "jQuery.parseJSON", function() {
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

QUnit.test( ".isNumeric (warn)", function( assert ) {
    assert.expect( 3 );

    expectMessage( assert, "warning on isNumeric (and possibly type)", function() {
		assert.equal( jQuery.isNumeric( 42 ), true, "isNumeric number" );
		assert.equal( jQuery.isNumeric( "nope" ), false, "isNumeric non number" );
    } );
} );

QUnit.test( "jQuery.isWindow", function( assert ) {
	assert.expect( 3 );

	expectMessage( assert, "isWindow", 2, function() {
		assert.equal( jQuery.isWindow( [] ), false, "array" );
		assert.equal( jQuery.isWindow( window ), true, "window" );
	} );
} );

QUnit.test( "jQuery.now", function( assert ) {
	assert.expect( 2 );

	expectMessage( assert, "now", 1, function() {
		assert.ok( typeof jQuery.now() === "number", "jQuery.now is a function" );
	} );
} );

QUnit.test( "jQuery.camelCase()", function( assert ) {

	var tests = {
		"foo-bar": "fooBar",
		"foo-bar-baz": "fooBarBaz",
		"girl-u-want": "girlUWant",
		"the-4th-dimension": "the-4thDimension",
		"-o-tannenbaum": "OTannenbaum",
		"-moz-illa": "MozIlla",
		"-ms-take": "msTake"
	};

	assert.expect( 8 );

	expectMessage( assert, "now", 7, function() {
		jQuery.each( tests, function( key, val ) {
			assert.equal( jQuery.camelCase( key ), val, "Converts: " + key + " => " + val );
		} );
	} );
} );

QUnit.test( "jQuery.unique", function( assert ) {
	assert.expect( 2 );

	expectMessage( assert, "jQuery.unique", function() {
		var body = jQuery( "body" )[ 0 ],
			head = jQuery( "head" )[ 0 ];
		assert.deepEqual(
			jQuery.unique( [ body, head, body ] ),
			[ head, body ],
			"unique sorted" );
	} );
} );

QUnit.test( "jQuery.holdReady (warn only)", function( assert ) {
	assert.expect( 1 );

	expectMessage( assert, "jQuery.holdReady", 2, function() {
		jQuery.holdReady( true );
		jQuery.holdReady( false );
	} );
} );

QUnit.test( "jQuery.trim", function( assert ) {
	assert.expect( 14 );

	var nbsp = String.fromCharCode( 160 );

	expectMessage( assert, "jQuery.trim", 13, function() {
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

QUnit.test( "jQuery.nodeName", function( assert ) {
	assert.expect( 2 );

	expectMessage( assert, "jQuery.nodeName", function() {
		var div = document.createElement( "div" );

		assert.equal( jQuery.nodeName( div, "div" ), true, "it's a div" );
	} );
} );

QUnit.test( "jQuery.isFunction", function( assert ) {
	assert.expect( 4 );

	expectMessage( assert, "jQuery.isFunction", function() {
		assert.equal( jQuery.isFunction( function() {} ), true, "function is function" );
		assert.equal( jQuery.isFunction( {} ), false, "object not function" );
		assert.equal( jQuery.isFunction( 1 ), false, "number not function" );
	} );
} );

QUnit.test( "jQuery.type (warn)", function( assert ) {
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

QUnit.test( "jQuery.isArray", function( assert ) {
	assert.expect( 4 );

	expectMessage( assert, "isArray", 3, function() {
		assert.equal( jQuery.isArray( [] ), true, "empty array" );
		assert.equal( jQuery.isArray( "" ), false, "empty string" );
		assert.equal( jQuery.isArray( jQuery().toArray() ), true, "toArray" );
	} );

} );

TestManager.runIframeTest( "old pre-4.0 jQuery", "core-jquery3.html",
	function( assert, jQuery, window, document, log ) {
		assert.expect( 1 );

		assert.ok( /jQuery 4/.test( log ), "logged: " + log );
} );

QUnit.test( "jQuery.fn.push", function( assert ) {
	assert.expect( 2 );

	expectMessage( assert, "jQuery.fn.push", 1, function() {
		var node = jQuery( "<div></div>" )[ 0 ],
			elem = jQuery( "<p></p><span></span>" );

		elem.push( node );

		assert.deepEqual( getTagNames( elem ), [ "p", "span", "div" ],
			"div added in-place" );
	} );
} );

QUnit.test( "jQuery.fn.sort", function( assert ) {
	assert.expect( 2 );

	expectMessage( assert, "jQuery.fn.sort", 1, function() {
		var elem = jQuery( "<span></span><div></div><p></p>" );

		elem.sort( function( node1, node2 ) {
			var tag1 = node1.tagName.toLowerCase(),
				tag2 = node2.tagName.toLowerCase();
			if ( tag1 < tag2 ) {
				return -1;
			}
			if ( tag1 > tag2 ) {
				return 1;
			}
			return 0;
		} );

		assert.deepEqual( getTagNames( elem ), [ "div", "p", "span" ],
			"element sorted in-place" );
	} );
} );

QUnit.test( "jQuery.fn.splice", function( assert ) {
	assert.expect( 2 );

	expectMessage( assert, "jQuery.fn.splice", 1, function() {
		var elem = jQuery( "<span></span><div></div><p></p>" );

		elem.splice( 1, 1, jQuery( "<i></i>" )[ 0 ], jQuery( "<b></b>" )[ 0 ] );

		assert.deepEqual( getTagNames( elem ), [ "span", "i", "b", "p" ],
			"splice removed & added in-place" );
	} );
} );

QUnit.test( "jQuery.proxy", function( assert ) {
	assert.expect( 10 );

	var test2, test3, test4, fn, cb,
		test = function() {
			assert.equal( this, thisObject, "Make sure that scope is set properly." );
		},
		thisObject = { foo: "bar", method: test };

	expectMessage( assert, "jQuery.proxy", 7, function() {

		// Make sure normal works
		test.call( thisObject );

		// Basic scoping
		jQuery.proxy( test, thisObject )();

		// Another take on it
		jQuery.proxy( thisObject, "method" )();

		// Make sure it doesn't freak out
		assert.equal( jQuery.proxy( null, thisObject ), undefined,
			"Make sure no function was returned." );

		// Partial application
		test2 = function( a ) {
			assert.equal( a, "pre-applied", "Ensure arguments can be pre-applied." );
		};
		jQuery.proxy( test2, null, "pre-applied" )();

		// Partial application w/ normal arguments
		test3 = function( a, b ) {
			assert.equal( b, "normal", "Ensure arguments can be pre-applied and passed as usual." );
		};
		jQuery.proxy( test3, null, "pre-applied" )( "normal" );

		// Test old syntax
		test4 = {
			"meth": function( a ) {
				assert.equal( a, "boom", "Ensure old syntax works." );
			}
		};
		jQuery.proxy( test4, "meth" )( "boom" );

		// jQuery 1.9 improved currying with `this` object
		fn = function() {
			assert.equal( Array.prototype.join.call( arguments, "," ),
				"arg1,arg2,arg3",
				"args passed" );
			assert.equal( this.foo, "bar", "this-object passed" );
		};
		cb = jQuery.proxy( fn, null, "arg1", "arg2" );
		cb.call( thisObject, "arg3" );
	} );
} );

"use strict";

QUnit.module( "selector", {
	beforeEach: function() {

		/* eslint-disable max-len */
		var template = "" +
			"<p id='firstp'>See <a id='john1' href='https://johnresig.com/blog/10th-anniversary-of-jquery/#body' rel='bookmark'>this blog entry</a> for more information.</p>" +
			"\n" +
			"<p id='ap'>" +
			"	Here are some [links] in a normal paragraph: <a id='google' href='https://www.google.com/' title='Google!'>Google</a>," +
			"	<a id='groups' href='https://groups.google.com/' class='GROUPS'>Google Groups (Link)</a>." +
			"	This link has <code id='code1'><a href='https://blog' id='anchor1'>class='blog'</a></code>:" +
			"	<a href='https://mozilla.org/' class='blog' hreflang='en' id='mozilla'>mozilla</a>" +
			"\n" +
			"</p>" +
			"<div id='foo'>" +
			"	<p id='sndp'>Everything inside the red border is inside a div with <code>id='foo'</code>.</p>" +
			"	<p lang='en' id='en'>This is a normal link: <a id='yahoo' href='https://www.yahoo.com/' class='blogTest'>Yahoo</a></p>" +
			"	<p id='sap'>This link has <code><a href='#2' id='anchor2'>class='blog'</a></code>: <a href='https://timmywil.com/' class='blog link' id='timmy'>Timmy Willison's Weblog</a></p>" +
			"</div>" +
			"\n" +
			"<form id='form' action='formaction'>" +
			"	<label for='action' id='label-for'>Action:</label>" +
			"	<input type='text' name='action' value='Test' id='text1' maxlength='30'/>" +
			"	<input type='text' name='text2' value='Test' id='text2' disabled='disabled'/>" +
			"	<input type='radio' name='radio1' id='radio1' value='on'/>" +
			"	<input type='radio' name='radio2' id='radio2' checked='checked'/>" +
			"</form>";
		/* eslint-enable */

		jQuery( "#qunit-fixture" ).append( template );
	}
} );

( function() {

/**
 * Asserts that a select matches the given IDs.
 * The select is not bound by a context.
 * @param {Function} assert - The assert function passed from the test
 * @param {String} message - Assertion name
 * @param {String} selector - jQuery selector
 * @param {String} expectedIds - Array of ids to construct what is expected
 * @example testSelector("Check for something", "p", ["foo", "bar"]);
 */
function testSelector( assert, message, selector, expectedIds ) {
	var r = [],
		i = 0;

	var elems = jQuery( selector ).get();

	for ( ; i < expectedIds.length; i++ ) {
		r.push( document.getElementById( expectedIds[ i ] ) );
	}

	assert.deepEqual( elems, r, message + " (" + selector + ")" );
}

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

QUnit.test( "custom pseudos", function( assert ) {
	assert.expect( 7 );

	expectNoWarning( assert, "custom pseudos", function() {
		try {
			jQuery.expr.pseudos.foundation = jQuery.expr.pseudos.root;
			assert.deepEqual(
				jQuery.find( ":foundation" ),
				[ document.documentElement ],
				"Copy element filter with new name"
			);
		} finally {
			delete jQuery.expr.pseudos.foundation;
		}

		try {
			jQuery.expr.setFilters.primary = jQuery.expr.setFilters.first;
			testSelector(
				assert,
				"Copy set filter with new name",
				"div#qunit-fixture :primary",
				[ "firstp" ]
			);
		} finally {
			delete jQuery.expr.setFilters.primary;
		}

		try {
			jQuery.expr.pseudos.aristotlean = jQuery.expr.createPseudo( function() {
				return function( elem ) {
					return !!elem.id;
				};
			} );
			testSelector(
				assert,
				"Custom element filter",
				"#foo :aristotlean",
				[ "sndp", "en", "yahoo", "sap", "anchor2", "timmy" ]
			);
		} finally {
			delete jQuery.expr.pseudos.aristotlean;
		}

		try {
			jQuery.expr.pseudos.endswith = jQuery.expr.createPseudo( function( text ) {
				return function( elem ) {
					return jQuery.text( elem ).slice( -text.length ) === text;
				};
			} );
			testSelector(
				assert,
				"Custom element filter with argument",
				"a:endswith(ogle)",
				[ "google" ]
			);
		} finally {
			delete jQuery.expr.pseudos.endswith;
		}

		try {
			jQuery.expr.setFilters.second = jQuery.expr.createPseudo( function() {
				return jQuery.expr.createPseudo( function( seed, matches ) {
					if ( seed[ 1 ] ) {
						matches[ 1 ] = seed[ 1 ];
						seed[ 1 ] = false;
					}
				} );
			} );
			testSelector( assert,
				"Custom set filter",
				"#qunit-fixture p:second",
				[ "ap" ]
			);
		} finally {
			delete jQuery.expr.pseudos.second;
		}

		try {
			jQuery.expr.setFilters.slice = jQuery.expr.createPseudo( function( argument ) {
				var bounds = argument.split( ":" );
				return jQuery.expr.createPseudo( function( seed, matches ) {
					var i = bounds[ 1 ];

					// Match elements found at the specified indexes
					while ( --i >= bounds[ 0 ] ) {
						if ( seed[ i ] ) {
							matches[ i ] = seed[ i ];
							seed[ i ] = false;
						}
					}
				} );
			} );
			testSelector(
				assert,
				"Custom set filter with argument",
				"#qunit-fixture p:slice(1:3)",
				[ "ap", "sndp" ]
			);
		} finally {
			delete jQuery.expr.pseudos.slice;
		}
	} );
} );

QUnit[
	jQueryVersionSince( "3.7.0" ) ? "test" : "skip"
]( "backwards-compatible custom pseudos", function( assert ) {
	assert.expect( 7 );

	var expectWarningWithProxy = typeof Proxy !== "undefined" ?
		expectWarning :
		function( _assert, _title, fn ) {
			fn();
			assert.ok( true, "No Proxy => warnings not expected" );
		};

	try {
		expectWarningWithProxy( assert, "Custom element filter with argument - setter", function() {
			jQuery.expr.pseudos.icontains = function( elem, i, match ) {
				return jQuery
					.text( elem )
					.toLowerCase()
					.indexOf( ( match[ 3 ] || "" ).toLowerCase() ) > -1;
			};
		} );
		expectWarning( assert, "Custom element filter with argument - getter", function() {
			testSelector(
				assert,
				"Custom element filter with argument",
				"a:icontains(THIS BLOG ENTRY)",
				[ "john1" ]
			);
		} );
	} finally {
		delete jQuery.expr.pseudos.icontains;
	}

	try {
		expectWarningWithProxy( assert, "Custom setFilter pseudo - setter", function() {
			jQuery.expr.setFilters.podium = function( elements, argument ) {
				var count = argument == null || argument === "" ? 3 : +argument;
				return elements.slice( 0, count );
			};
		} );
		expectWarning( assert, "Custom setFilter pseudo - getter", function() {

			// Using TAG as the first token here forces this setMatcher into a fail state
			// Where the descendent combinator was lost
			testSelector(
				assert,
				"Custom setFilter",
				"form#form :PODIUM",
				[ "label-for", "text1", "text2" ]
			);
			testSelector(
				assert,
				"Custom setFilter with argument",
				"#form input:Podium(1)",
				[ "text1" ]
			);
		} );
	} finally {
		delete jQuery.expr.setFilters.podium;
	}
} );

} )();

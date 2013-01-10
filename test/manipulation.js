
module( "manipulation" );

test( "andSelf", function() {
	expect( 2 );

	expectWarning( "andSelf", function() {
		var $test = jQuery("<div>Beautiful<p>World</p></div>").find("p").andSelf();
		equal( $test.length, 2, "correct element count" );
	});
});

(function() {
	var
		contexts = {
			"undefined": undefined,
			"element": document.documentElement,
			"document": document,
			"collection": [ document.documentElement ]
		},
		// Function is necessary because elements are within the test fixture
		cleanInput = function() {
			return [
				0,
				1,
				"text",
				document.getElementById("ap"),
				jQuery("#lengthtest input"),
				"<div><script id='js' type='text/javascript'/><script id='notJs' type='text/example'/><script id='noType'/></div>"
			];
		},
		getText = function( node ) {
			return node.nodeType === 3 && node.nodeValue;
		},
		verifyCleanOutput = function( nodes, scriptsExpected ) {
			deepEqual(
				jQuery.map( nodes, getText ),
				[
					// text
					"0",
					"1",
					"text",
					// #ap
					false,
					// #lengthtest input
					false,
					false,
					// div
					false
				// scripts (optional)
				].concat( jQuery.map( new Array(scriptsExpected), function() { return false; } ) ),
				"Correct nodes"
			);

			strictEqual( nodes[3].id, "ap", "Element" );
			strictEqual( nodes[4].id, "length", "List" );
			strictEqual( nodes[5].id, "idTest", "List" );
		};

	jQuery.each( contexts, function( type, context ) {
		test( "clean(content, " + type + ")", function() {
			expect( 7 );

			var nodes = jQuery.clean( cleanInput(), context ),
				scripts = nodes && nodes[ nodes.length - 1 ].childNodes;

			verifyCleanOutput( nodes, 0 );
			strictEqual( scripts[0].id, "js", "Script" );
			strictEqual( scripts[1].id, "notJs", "Script (non-executable)" );
			strictEqual( scripts[2].id, "noType", "Script (no type)" );
		});

		test( "clean(content, " + type + ", fragment)", function() {
			expect( 8 );

			var fragment = document.createDocumentFragment(),
				nodes = jQuery.clean( cleanInput(), context, fragment ),
				scripts = nodes && nodes.slice( -2 );

			verifyCleanOutput( nodes, 2 );
			strictEqual( scripts[0].id, "js", "Script" );
			strictEqual( scripts[1].id, "noType", "Script (no type)" );
			strictEqual( nodes[ nodes.length - 3 ].firstChild.id, "notJs", "Script (non-executable)" );
			deepEqual( jQuery.makeArray(fragment.childNodes), nodes, "fragment childNodes include scripts" );
		});

		test( "clean(content, " + type + ", fragment, scripts)", function() {
			expect( 8 );

			var fragment = document.createDocumentFragment(),
				scripts = [],
				nodes = jQuery.clean( cleanInput(), context, fragment, scripts );

			verifyCleanOutput( nodes, 2 );
			strictEqual( scripts[0].id, "js", "Script" );
			strictEqual( scripts[1].id, "noType", "Script (no type)" );
			strictEqual( nodes[ nodes.length - 3 ].firstChild.id, "notJs", "Script (non-executable)" );
			deepEqual( jQuery.makeArray(fragment.childNodes), nodes.slice( 0, -2 ),
				"fragment childNodes exclude scripts" );
		});
	});

	jQuery.each( contexts, function( type, context ) {
		test( "buildFragment (" + type + " context)", function() {
			expect( 7 );

			var frag, div, html,
				checkWarnings = function( name, fn ) {
					ok( true, name +
						": Unable to discern external calls on this jQuery version" );
					fn();
				};

			frag = jQuery.buildFragment( [], context );
			equal( frag.fragment.childNodes.length, 0, "empty frag is empty" );
			
			if ( frag.nodeType ) {
				checkWarnings = expectWarning;
			}
			checkWarnings( "buildFragment", function() {
				frag = jQuery.buildFragment( [ document.createElement( "b" ) ], context ).fragment;
				equal( frag.childNodes.length, 1, "frag from DOM element" );
				equal( frag.firstChild.nodeName.toLowerCase(), "b", "frag node is correct" );

				html = "<p>sue<em>bawls</em></p><div>cheese<em>balls</em></div>";
				frag = jQuery.buildFragment( [ html ], context ).fragment;
				equal( frag.childNodes.length, 2, "frag from HTML" );
				equal( frag.lastChild.nodeName.toLowerCase(), "div", "frag last node is correct" );
				div = document.createElement( "div" );
				// Clone ensures that we don't screw up a cached fragment in jQuery < 1.9
				div.appendChild( jQuery.clone(frag) );
				equal( div.innerHTML.toLowerCase().replace( /[\s\n]+/, "" ), html, "frag html" );
			});
		});
	});
})();

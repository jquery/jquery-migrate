import { jQueryVersionSince } from "../compareVersions.js";
import { migratePatchAndWarnFunc } from "../main.js";
import "../disablePatches.js";

var arr = [],
	push = arr.push,
	sort = arr.sort,
	splice = arr.splice,
	class2type = {},

	// Require that the "whitespace run" starts from a non-whitespace
	// to avoid O(N^2) behavior when the engine would try matching "\s+$" at each space position.
	rtrim = /^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;

function isFunction( obj ) {

	// Support: Chrome <=57, Firefox <=52
	// In some browsers, typeof returns "function" for HTML <object> elements
	// (i.e., `typeof document.createElement( "object" ) === "function"`).
	// We don't want to classify *any* DOM node as a function.
	// Support: QtWeb <=3.8.5, WebKit <=534.34, wkhtmltopdf tool <=0.12.5
	// Plus for old WebKit, typeof returns "function" for HTML collections
	// (e.g., `typeof document.getElementsByTagName("div") === "function"`). (gh-4756)
	return typeof obj === "function" && typeof obj.nodeType !== "number" &&
		typeof obj.item !== "function";
}

// The number of elements contained in the matched element set
migratePatchAndWarnFunc( jQuery.fn, "size", function() {
	return this.length;
}, "size",
"jQuery.fn.size() is deprecated and removed; use the .length property" );

migratePatchAndWarnFunc( jQuery, "parseJSON", function() {
	return JSON.parse.apply( null, arguments );
}, "parseJSON",
"jQuery.parseJSON is deprecated; use JSON.parse" );

migratePatchAndWarnFunc( jQuery, "holdReady", jQuery.holdReady,
	"holdReady", "jQuery.holdReady is deprecated" );

migratePatchAndWarnFunc( jQuery, "unique", jQuery.uniqueSort,
	"unique", "jQuery.unique is deprecated; use jQuery.uniqueSort" );

// Prior to jQuery 3.1.1 there were internal refs so we don't warn there
if ( jQueryVersionSince( "3.1.1" ) ) {
	migratePatchAndWarnFunc( jQuery, "trim", function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "$1" );
	}, "trim",
	"jQuery.trim is deprecated; use String.prototype.trim" );
}

// Prior to jQuery 3.2 there were internal refs so we don't warn there
if ( jQueryVersionSince( "3.2.0" ) ) {
	migratePatchAndWarnFunc( jQuery, "nodeName", function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	}, "nodeName",
	"jQuery.nodeName is deprecated" );

	migratePatchAndWarnFunc( jQuery, "isArray", Array.isArray, "isArray",
		"jQuery.isArray is deprecated; use Array.isArray"
	);
}

if ( jQueryVersionSince( "3.3.0" ) ) {

	migratePatchAndWarnFunc( jQuery, "isNumeric",
		function( obj ) {

			// As of jQuery 3.0, isNumeric is limited to
			// strings and numbers (primitives or objects)
			// that can be coerced to finite numbers (gh-2662)
			var type = typeof obj;
			return ( type === "number" || type === "string" ) &&

				// parseFloat NaNs numeric-cast false positives ("")
				// ...but misinterprets leading-number strings, e.g. hex literals ("0x...")
				// subtraction forces infinities to NaN
				!isNaN( obj - parseFloat( obj ) );
		}, "isNumeric",
		"jQuery.isNumeric() is deprecated"
	);

	// Populate the class2type map
	jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".
		split( " " ),
	function( _, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );

	migratePatchAndWarnFunc( jQuery, "type", function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}

		// Support: Android <=2.3 only (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ Object.prototype.toString.call( obj ) ] || "object" :
			typeof obj;
	}, "type",
	"jQuery.type is deprecated" );

	migratePatchAndWarnFunc( jQuery, "isFunction", function( obj ) {
		return isFunction( obj );
	}, "isFunction",
	"jQuery.isFunction() is deprecated" );

	migratePatchAndWarnFunc( jQuery, "isWindow",
		function( obj ) {
			return obj != null && obj === obj.window;
		}, "isWindow",
		"jQuery.isWindow() is deprecated"
	);

	// Bind a function to a context, optionally partially applying any
	// arguments.
	// jQuery.proxy is deprecated to promote standards (specifically Function#bind)
	// However, it is not slated for removal any time soon
	migratePatchAndWarnFunc( jQuery, "proxy", jQuery.proxy,
		"proxy", "DEPRECATED: jQuery.proxy()" );

}

if ( jQueryVersionSince( "3.7.0" ) ) {
	migratePatchAndWarnFunc( jQuery.fn, "push", push, "push",
		"jQuery.fn.push() is deprecated; use .add() or convert to an array" );
	migratePatchAndWarnFunc( jQuery.fn, "sort", sort, "sort",
		"jQuery.fn.sort() is deprecated; convert to an array before sorting" );
	migratePatchAndWarnFunc( jQuery.fn, "splice", splice, "splice",
		"jQuery.fn.splice() is deprecated; use .slice() or .not() with .eq()" );
}

import { migrateWarnProp, migratePatchAndWarnFunc, migratePatchAndInfoFunc } from "../main.js";
import "../disablePatches.js";

var arr = [],
	push = arr.push,
	sort = arr.sort,
	splice = arr.splice,
	class2type = {},

	// Require that the "whitespace run" starts from a non-whitespace
	// to avoid O(N^2) behavior when the engine would try matching "\s+$" at each space position.
	rtrim = /^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;

migratePatchAndWarnFunc( jQuery, "parseJSON", function() {
	return JSON.parse.apply( null, arguments );
}, "parseJSON",
"jQuery.parseJSON is removed; use JSON.parse" );

migratePatchAndInfoFunc( jQuery, "holdReady", jQuery.holdReady,
	"holdReady", "jQuery.holdReady() is deprecated" );

migratePatchAndWarnFunc( jQuery, "unique", jQuery.uniqueSort,
	"unique", "jQuery.unique() is removed; use jQuery.uniqueSort()" );

migratePatchAndWarnFunc( jQuery, "trim", function( text ) {
	return text == null ?
		"" :
		( text + "" ).replace( rtrim, "$1" );
}, "trim",
"jQuery.trim() is removed; use String.prototype.trim" );

migratePatchAndWarnFunc( jQuery, "nodeName", function( elem, name ) {
	return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
}, "nodeName",
"jQuery.nodeName() is removed" );

migratePatchAndWarnFunc( jQuery, "isArray", Array.isArray, "isArray",
	"jQuery.isArray() is removed; use Array.isArray()"
);

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
	"jQuery.isNumeric() is removed"
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

	return typeof obj === "object" ?
		class2type[ Object.prototype.toString.call( obj ) ] || "object" :
		typeof obj;
}, "type",
"jQuery.type() is removed" );

migratePatchAndWarnFunc( jQuery, "isFunction", function( obj ) {
	return typeof obj === "function";
}, "isFunction",
"jQuery.isFunction() is removed" );

migratePatchAndWarnFunc( jQuery, "isWindow",
	function( obj ) {
		return obj != null && obj === obj.window;
	}, "isWindow",
	"jQuery.isWindow() is removed"
);

// Bind a function to a context, optionally partially applying any
// arguments.
// jQuery.proxy is deprecated to promote standards (specifically Function#bind)
// However, it is not slated for removal any time soon
migratePatchAndInfoFunc( jQuery, "proxy", jQuery.proxy,
	"proxy", "jQuery.proxy() is deprecated" );

migrateWarnProp( jQuery.fn, "push", push, "push",
	"jQuery.fn.push() is removed; use .add() or convert to an array" );
migrateWarnProp( jQuery.fn, "sort", sort, "sort",
	"jQuery.fn.sort() is removed; convert to an array before sorting" );
migrateWarnProp( jQuery.fn, "splice", splice, "splice",
	"jQuery.fn.splice() is removed; use .slice() or .not() with .eq()" );

import { jQueryVersionSince } from "../compareVersions.js";
import {
	migratePatchFunc,
	migrateWarn,
	migratePatchAndWarnFunc,
	migrateWarnProp
} from "../main.js";
import "../disablePatches.js";

var findProp,
	class2type = {},
	oldInit = jQuery.fn.init,
	oldFind = jQuery.find,

	rattrHashTest = /\[(\s*[-\w]+\s*)([~|^$*]?=)\s*([-\w#]*?#[-\w#]*)\s*\]/,
	rattrHashGlob = /\[(\s*[-\w]+\s*)([~|^$*]?=)\s*([-\w#]*?#[-\w#]*)\s*\]/g,

	// Require that the "whitespace run" starts from a non-whitespace
	// to avoid O(N^2) behavior when the engine would try matching "\s+$" at each space position.
	rtrim = /^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;

migratePatchFunc( jQuery.fn, "init", function( arg1 ) {
	var args = Array.prototype.slice.call( arguments );

	if ( jQuery.migrateIsPatchEnabled( "selector-empty-id" ) &&
		typeof arg1 === "string" && arg1 === "#" ) {

		// JQuery( "#" ) is a bogus ID selector, but it returned an empty set
		// before jQuery 3.0
		migrateWarn( "selector-empty-id", "jQuery( '#' ) is not a valid selector" );
		args[ 0 ] = [];
	}

	return oldInit.apply( this, args );
}, "selector-empty-id" );

// This is already done in Core but the above patch will lose this assignment
// so we need to redo it. It doesn't matter whether the patch is enabled or not
// as the method is always going to be a Migrate-created wrapper.
jQuery.fn.init.prototype = jQuery.fn;

migratePatchFunc( jQuery, "find", function( selector ) {
	var args = Array.prototype.slice.call( arguments );

	// Support: PhantomJS 1.x
	// String#match fails to match when used with a //g RegExp, only on some strings
	if ( typeof selector === "string" && rattrHashTest.test( selector ) ) {

		// The nonstandard and undocumented unquoted-hash was removed in jQuery 1.12.0
		// First see if qS thinks it's a valid selector, if so avoid a false positive
		try {
			window.document.querySelector( selector );
		} catch ( err1 ) {

			// Didn't *look* valid to qSA, warn and try quoting what we think is the value
			selector = selector.replace( rattrHashGlob, function( _, attr, op, value ) {
				return "[" + attr + op + "\"" + value + "\"]";
			} );

			// If the regexp *may* have created an invalid selector, don't update it
			// Note that there may be false alarms if selector uses jQuery extensions
			try {
				window.document.querySelector( selector );
				migrateWarn( "selector-hash",
					"Attribute selector with '#' must be quoted: " + args[ 0 ] );
				args[ 0 ] = selector;
			} catch ( err2 ) {
				migrateWarn( "selector-hash",
					"Attribute selector with '#' was not fixed: " + args[ 0 ] );
			}
		}
	}

	return oldFind.apply( this, args );
}, "selector-hash" );

// Copy properties attached to original jQuery.find method (e.g. .attr, .isXML)
for ( findProp in oldFind ) {
	if ( Object.prototype.hasOwnProperty.call( oldFind, findProp ) ) {
		jQuery.find[ findProp ] = oldFind[ findProp ];
	}
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

// Now jQuery.expr.pseudos is the standard incantation
migrateWarnProp( jQuery.expr, "filters", jQuery.expr.pseudos, "expr-pre-pseudos",
	"jQuery.expr.filters is deprecated; use jQuery.expr.pseudos" );
migrateWarnProp( jQuery.expr, ":", jQuery.expr.pseudos, "expr-pre-pseudos",
	"jQuery.expr[':'] is deprecated; use jQuery.expr.pseudos" );

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

	migratePatchAndWarnFunc( jQuery, "isFunction",
		function( obj ) {
			return typeof obj === "function";
		}, "isFunction",
		"jQuery.isFunction() is deprecated" );

	migratePatchAndWarnFunc( jQuery, "isWindow",
		function( obj ) {
			return obj != null && obj === obj.window;
		}, "isWindow",
		"jQuery.isWindow() is deprecated"
	);
}

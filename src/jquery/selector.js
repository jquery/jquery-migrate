import { jQueryVersionSince } from "../compareVersions.js";
import { migratePatchFunc, migrateWarnProp, migrateWarn } from "../main.js";

var findProp,
	oldInit = jQuery.fn.init,
	oldFind = jQuery.find,

	rattrHashTest = /\[(\s*[-\w]+\s*)([~|^$*]?=)\s*([-\w#]*?#[-\w#]*)\s*\]/,
	rattrHashGlob = /\[(\s*[-\w]+\s*)([~|^$*]?=)\s*([-\w#]*?#[-\w#]*)\s*\]/g;

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

// Now jQuery.expr.pseudos is the standard incantation
migrateWarnProp( jQuery.expr, "filters", jQuery.expr.pseudos, "expr-pre-pseudos",
	"jQuery.expr.filters is deprecated; use jQuery.expr.pseudos" );
migrateWarnProp( jQuery.expr, ":", jQuery.expr.pseudos, "expr-pre-pseudos",
	"jQuery.expr[':'] is deprecated; use jQuery.expr.pseudos" );

function markFunction( fn ) {
	fn[ jQuery.expando ] = true;
	return fn;
}

// jQuery older than 3.7.0 used Sizzle which has its own private expando
// variable that we cannot access. This makes thi patch impossible in those
// jQuery versions.
if ( jQueryVersionSince( "3.7.0" ) ) {
	migratePatchFunc( jQuery.expr.filter, "PSEUDO", function( pseudo, argument ) {

		// pseudo-class names are case-insensitive
		// https://www.w3.org/TR/selectors/#pseudo-classes
		// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
		// Remember that setFilters inherits from pseudos
		var args,
			fn = jQuery.expr.pseudos[ pseudo ] ||
				jQuery.expr.setFilters[ pseudo.toLowerCase() ] ||
				jQuery.error(
					"Syntax error, unrecognized expression: unsupported pseudo: " +
						pseudo );

		// The user may use createPseudo to indicate that
		// arguments are needed to create the filter function
		// just as jQuery does
		if ( fn[ jQuery.expando ] ) {
			return fn( argument );
		}

		// But maintain support for old signatures
		if ( fn.length > 1 ) {
			migrateWarn( "legacy-custom-pseudos",
				"Pseudos with multiple arguments are deprecated; " +
					"use jQuery.expr.createPseudo()" );
			args = [ pseudo, pseudo, "", argument ];
			return jQuery.expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
				markFunction( function( seed, matches ) {
					var idx,
						matched = fn( seed, argument ),
						i = matched.length;
					while ( i-- ) {
						idx = Array.prototype.indexOf.call( seed, matched[ i ] );
						seed[ idx ] = !( matches[ idx ] = matched[ i ] );
					}
				} ) :
				function( elem ) {
					return fn( elem, 0, args );
				};
		}

		return fn;
	}, "legacy-custom-pseudos" );

	if ( typeof Proxy !== "undefined" ) {
		jQuery.each( [ "pseudos", "setFilters" ], function( _, api ) {
			jQuery.expr[ api ] = new Proxy( jQuery.expr[ api ], {
				set: function( _target, _prop, fn ) {
					if ( typeof fn === "function" && !fn[ jQuery.expando ] && fn.length > 1 ) {
						migrateWarn( "legacy-custom-pseudos",
							"Pseudos with multiple arguments are deprecated; " +
								"use jQuery.expr.createPseudo()" );
					}
					return Reflect.set.apply( this, arguments );
				}
			} );
		} );
	}
}

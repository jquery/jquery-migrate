import { migratePatchFunc, migrateInfoProp, migrateInfo } from "../main.js";

// Now jQuery.expr.pseudos is the standard incantation
migrateInfoProp( jQuery.expr, "filters", jQuery.expr.pseudos, "expr-pre-pseudos",
	"jQuery.expr.filters is deprecated; use jQuery.expr.pseudos" );
migrateInfoProp( jQuery.expr, ":", jQuery.expr.pseudos, "expr-pre-pseudos",
	"jQuery.expr[':'] is deprecated; use jQuery.expr.pseudos" );

function markFunction( fn ) {
	fn[ jQuery.expando ] = true;
	return fn;
}

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
		migrateInfo( "legacy-custom-pseudos",
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
					migrateInfo( "legacy-custom-pseudos",
						"Pseudos with multiple arguments are deprecated; " +
							"use jQuery.expr.createPseudo()" );
				}
				return Reflect.set.apply( this, arguments );
			}
		} );
	} );
}

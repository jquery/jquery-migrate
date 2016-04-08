
var oldInit = jQuery.fn.init,
	oldIsNumeric = jQuery.isNumeric,
	rattrHash = /\[\s*\w+\s*[~|^$*]?=\s*(?![\s'"])[^#\]]*#/;

jQuery.fn.init = function( selector ) {
	var args = Array.prototype.slice.call( arguments );

	if ( selector === "#" ) {

		// JQuery( "#" ) is a bogus ID selector, but it returned an empty set before jQuery 3.0
		migrateWarn( "jQuery( '#' ) is not a valid selector" );
		args[ 0 ] = selector = [];

	} else if ( rattrHash.test( selector ) ) {

		// The nonstandard and undocumented unquoted-hash was removed in jQuery 1.12.0
		// Note that this doesn't actually fix the selector due to potential false positives
		migrateWarn( "Attribute selectors with '#' must be quoted: '" + selector + "'" );
	}

	return oldInit.apply( this, args );
};
jQuery.fn.init.prototype = jQuery.fn;

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	migrateWarn( "jQuery.fn.size() is deprecated; use the .length property" );
	return this.length;
};

jQuery.parseJSON = function() {
	migrateWarn( "jQuery.parseJSON is deprecated; use JSON.parse" );
	return JSON.parse.apply( null, arguments );
};

jQuery.isNumeric = function( val ) {

	// 2.x implementation of isNumeric
	function isNumeric2( obj ) {
		return !jQuery.isArray( obj ) && ( obj - parseFloat( obj ) + 1 ) >= 0;
	}

	var newValue = oldIsNumeric( val ),
		oldValue = isNumeric2( val );

	if ( newValue !== oldValue ) {
		migrateWarn( "jQuery.isNumeric() should not be called on constructed objects" );
	}

	return oldValue;
};

migrateWarnProp( jQuery, "unique", jQuery.uniqueSort,
	"jQuery.unique is deprecated, use jQuery.uniqueSort" );

// Now jQuery.expr.pseudos is the standard incantation
migrateWarnProp( jQuery.expr, "filters", jQuery.expr.pseudos,
	"jQuery.expr.filters is now jQuery.expr.pseudos" );
migrateWarnProp( jQuery.expr, ":", jQuery.expr.pseudos,
	"jQuery.expr[\":\"] is now jQuery.expr.pseudos" );

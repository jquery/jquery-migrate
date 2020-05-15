import { migrateWarn } from "../main.js";

var oldOffset = jQuery.fn.offset;

function isAttached( elem ) {
	return jQuery.contains( elem.ownerDocument, elem );
}

jQuery.fn.offset = function() {
	var elem = this[ 0 ],
		bogus = { top: 0, left: 0 };

	if ( !elem || !elem.nodeType ) {
		migrateWarn( "jQuery.fn.offset() requires a valid DOM element" );
		return arguments.length ? this : undefined;
	}

	if ( !isAttached( elem ) ) {
		migrateWarn( "jQuery.fn.offset() requires an element connected to a document" );

		// Only return the bogus value for the getter.
		if ( !arguments.length ) {
			return bogus;
		}
	}

	return oldOffset.apply( this, arguments );
};

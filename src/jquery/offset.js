import { migrateWarn } from "../main.js";

var oldOffset = jQuery.fn.offset;

jQuery.fn.offset = function() {
	var elem = this[ 0 ];

	if ( elem && ( !elem.nodeType || !elem.getBoundingClientRect ) ) {
		migrateWarn( "jQuery.fn.offset() requires a valid DOM element" );
		return arguments.length ? this : undefined;
	}

	return oldOffset.apply( this, arguments );
};

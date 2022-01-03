import { migrateWarn, migratePatchFunc } from "../main.js";

var origOffset = jQuery.fn.offset;

migratePatchFunc( jQuery.fn, "offset", function() {
	var elem = this[ 0 ];

	if ( elem && ( !elem.nodeType || !elem.getBoundingClientRect ) ) {
		migrateWarn( "offset-valid-elem", "jQuery.fn.offset() requires a valid DOM element" );
		return arguments.length ? this : undefined;
	}

	return origOffset.apply( this, arguments );
}, "offset-valid-elem" );

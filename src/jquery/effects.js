import { migrateWarn } from "../main.js";
import "../disablePatches.js";

// Support jQuery slim which excludes the effects module
if ( jQuery.fx ) {

var intervalValue = jQuery.fx.interval,
	intervalMsg = "jQuery.fx.interval is deprecated and removed";

// Don't warn if document is hidden, jQuery uses setTimeout (gh-292)
Object.defineProperty( jQuery.fx, "interval", {
	configurable: true,
	enumerable: true,
	get: function() {
		if ( !window.document.hidden ) {
			migrateWarn( "fx-interval", intervalMsg );
		}

		// Only fallback to the default if patch is enabled
		if ( !jQuery.migrateIsPatchEnabled( "fx-interval" ) ) {
			return intervalValue;
		}
		return intervalValue === undefined ? 13 : intervalValue;
	},
	set: function( newValue ) {
		migrateWarn( "fx-interval", intervalMsg );
		intervalValue = newValue;
	}
} );

}

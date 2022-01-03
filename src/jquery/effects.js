import { migratePatchFunc, migrateWarn } from "../main.js";
import "../disablePatches.js";

// Support jQuery slim which excludes the effects module
if ( jQuery.fx ) {

var intervalValue, intervalMsg,
	oldTweenRun = jQuery.Tween.prototype.run,
	linearEasing = function( pct ) {
		return pct;
	};

migratePatchFunc( jQuery.Tween.prototype, "run", function( ) {
	if ( jQuery.easing[ this.easing ].length > 1 ) {
		migrateWarn(
			"easing-one-arg",
			"'jQuery.easing." + this.easing.toString() + "' should use only one argument"
		);

		jQuery.easing[ this.easing ] = linearEasing;
	}

	oldTweenRun.apply( this, arguments );
}, "easing-one-arg" );

intervalValue = jQuery.fx.interval;
intervalMsg = "jQuery.fx.interval is deprecated";

// Support: IE9, Android <=4.4
// Avoid false positives on browsers that lack rAF
// Don't warn if document is hidden, jQuery uses setTimeout (#292)
if ( window.requestAnimationFrame ) {
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

}

var oldTweenRun = jQuery.Tween.prototype.run;
var linearEasing = function( pct ) {
		return pct;
	};

jQuery.Tween.prototype.run = function( ) {
	if ( jQuery.easing[ this.easing ].length > 1 ) {
		migrateWarn(
			"'jQuery.easing." + this.easing.toString() + "' should use only one argument"
		);

		jQuery.easing[ this.easing ] = linearEasing;
	}

	oldTweenRun.apply( this, arguments );
};

var intervalValue = jQuery.fx.interval || 13,
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
				migrateWarn( intervalMsg );
			}
			return intervalValue;
		},
		set: function( newValue ) {
			migrateWarn( intervalMsg );
			intervalValue = newValue;
		}
	} );
}

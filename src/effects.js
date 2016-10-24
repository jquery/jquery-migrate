var oldTweenRun = jQuery.Tween.prototype.run;

jQuery.Tween.prototype.run = function( ) {
	if ( jQuery.easing[ this.easing ].length > 1 ) {
		migrateWarn(
			"easing function " +
			"\"jQuery.easing." + this.easing.toString() +
			"\" should use only first argument"
		);

		var oldEasing = jQuery.easing[ this.easing ];
		jQuery.easing[ this.easing ] = function( percent ) {
			return oldEasing.call( jQuery.easing, percent, percent, 0, 1, 1 );
		}.bind( this );
	}

	oldTweenRun.apply( this, arguments );
};

jQuery.fx.interval = jQuery.fx.interval || 13;

// Support: IE9, Android <=4.4
// Avoid false positives on browsers that lack rAF
if ( window.requestAnimationFrame ) {
	migrateWarnProp( jQuery.fx, "interval", jQuery.fx.interval,
		"jQuery.fx.interval is deprecated" );
}

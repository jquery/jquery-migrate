var oldTweenRun = jQuery.Tween.prototype.run;

jQuery.Tween.prototype.run = function( percent ) {
	if ( jQuery.easing[ this.easing ].length > 1 ) {
		migrateWarn(
			"easing function " +
			"\"jQuery.easing." + this.easing.toString() +
			"\" should use only first argument"
		);

		jQuery.easing[ this.easing ] = jQuery.easing[ this.easing ].bind(
			jQuery.easing,
			percent, this.options.duration * percent, 0, 1, this.options.duration
		);
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

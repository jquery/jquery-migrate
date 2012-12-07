
var warnedAbout = {};

// List of warnings already given; public read only
jQuery.compatWarnings = [];

// Forget any warnings we've already given; public
jQuery.compatReset = function() {
	warnedAbout = {};
	jQuery.compatWarnings.length = 0;
};

function compatWarn( msg) {
	if ( JQCOMPAT_WARN ) {
		if ( !warnedAbout[ msg ] ) {
			warnedAbout[ msg ] = true;
			jQuery.compatWarnings.push( msg );
			if ( window.console && console.warn ) {
				console.warn( "JQCOMPAT: " + msg );
			}
		}
	}
}

function compatWarnProp( obj, prop, value, msg ) {
	if ( JQCOMPAT_WARN && Object.defineProperty ) {
		// On ES5 browsers (non-oldIE), warn if the code tries to get prop;
		// allow property to be overwritten in case some other plugin wants it
		try {
			Object.defineProperty( obj, prop, {
				configurable: true,
				enumerable: true,
				get: function() {
					compatWarn( msg );
					return value;
				},
				set: function( newValue ) {
					compatWarn( msg );
					value = newValue;
				}
			});
			return;
		} catch( err ) {
			// IE8 is a dope about Object.defineProperty, can't warn there
		}
	}

	// Non-ES5 (or broken) browser; just set the property
	jQuery._definePropertyBroken = true;
	obj[ prop ] = value;
}

if ( JQCOMPAT_WARN && document.compatMode === "BackCompat" ) {
	// jQuery has never supported or tested Quirks Mode
	compatWarn( "jQuery is not compatible with Quirks Mode" );
}

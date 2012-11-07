var warnList = {};

function compatWarn( msg) {
	if ( JQCOMPAT_WARN && window.console && console.warn && !warnList[ msg ] ) {
		// Only warn about a msg once to reduce console clutter
		warnList[ msg ] = true;
		console.warn( "JQCOMPAT: " + msg );
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
				writable: true,
				get: function() {
					compatWarn( msg );
					return value;
				}
			});
			return;
		} catch( err ) {
			// IE8 is a dope about Object.defineProperty, can't warn there
		}
	}
	
	// Non-ES5 (or broken) browser; just set the property
	obj[ prop ] = value;
}

if ( JQCOMPAT_WARN && document.compatMode === "BackCompat" ) {
	// jQuery has never supported or tested Quirks Mode
	compatWarn( "jQuery is not compatible with Quirks Mode" );
}

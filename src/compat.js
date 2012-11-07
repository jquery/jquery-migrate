
var warnList = {};

function compatWarn( msg) {
	// Only warn about a msg once to reduce console clutter
	if ( window.console && console.warn && !warnList[ msg ] ) {
		warnList[ msg ] = true;
		console.warn( "JQCOMPAT: " + msg );
	}
}

function compatWarnProp( obj, prop, value, msg ) {
	// On ES5 browsers (non-oldIE), warn if the code tries to get jQuery.browser;
	// allow property to be overwritten in case some other plugin wants it
	if ( Object.defineProperty ) {
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
		} catch( err ) {
			// IE8 is a dope about Object.defineProperty, can't warn there
		}
	}
}

// jQuery has never supported or tested Quirks Mode
if ( document.compatMode === "BackCompat" ) {
	compatWarn( "jQuery is not compatible with Quirks Mode" );
}

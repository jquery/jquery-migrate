
var internalSwapCall = false;

// If this version of jQuery has .swap(), don't false-alarm on internal uses
if ( jQuery.swap ) {
	jQuery.each( [ "height", "width", "reliableMarginRight" ], function( _, name ) {
		var oldHook = jQuery.cssHooks[ name ] && jQuery.cssHooks[ name ].get;

		if ( oldHook ) {
			jQuery.cssHooks[ name ].get = function() {
				var ret;

				internalSwapCall = true;
				ret = oldHook.apply( this, arguments );
				internalSwapCall = false;
				return ret;
			};
		}
	} );
}

jQuery.swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	if ( !internalSwapCall ) {
		migrateWarn( "jQuery.swap() is undocumented and deprecated" );
	}

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};

if ( jQueryVersionSince( "3.4.0" ) && typeof Proxy !== "undefined" ) {

	jQuery.cssProps = new Proxy( jQuery.cssProps || {}, {
		set: function() {
			migrateWarn( "JQMIGRATE: jQuery.cssProps is deprecated" );
			return Reflect.set.apply( this, arguments );
		}
	} );
}

if ( !jQuery.cssNumber ) {
	jQuery.cssNumber = {};
}
migrateWarnProp( jQuery, "cssNumber", jQuery.cssNumber,
	"jQuery.cssNumber is deprecated" );

var oldFnCss = jQuery.fn.css;

jQuery.fn.css = function( name, value ) {
	var origThis = this;
	if ( typeof name !== "string" ) {
		jQuery.each( name, function( n, v ) {
			jQuery.fn.css.call( origThis, n, v );
		} );
	}
	if ( typeof value === "number" ) {
		migrateWarn( "Use of number-typed values is deprecated in jQuery.fn.css" );
	}

	return oldFnCss.apply( this, arguments );
};

import { jQueryVersionSince } from "../compareVersions.js";
import { migrateWarn, migratePatchFunc } from "../main.js";
import { camelCase } from "../utils.js";

var origFnCss,
	internalSwapCall = false,
	ralphaStart = /^[a-z]/,

	// The regex visualized:
	//
	//                         /----------\
	//                        |            |    /-------\
	//                        |  / Top  \  |   |         |
	//         /--- Border ---+-| Right  |-+---+- Width -+---\
	//        |                 | Bottom |                    |
	//        |                  \ Left /                     |
	//        |                                               |
	//        |                              /----------\     |
	//        |          /-------------\    |            |    |- END
	//        |         |               |   |  / Top  \  |    |
	//        |         |  / Margin  \  |   | | Right  | |    |
	//        |---------+-|           |-+---+-| Bottom |-+----|
	//        |            \ Padding /         \ Left /       |
	// BEGIN -|                                               |
	//        |                /---------\                    |
	//        |               |           |                   |
	//        |               |  / Min \  |    / Width  \     |
	//         \--------------+-|       |-+---|          |---/
	//                           \ Max /       \ Height /
	rautoPx = /^(?:Border(?:Top|Right|Bottom|Left)?(?:Width|)|(?:Margin|Padding)?(?:Top|Right|Bottom|Left)?|(?:Min|Max)?(?:Width|Height))$/;

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

migratePatchFunc( jQuery, "swap", function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	if ( !internalSwapCall ) {
		migrateWarn( "swap", "jQuery.swap() is undocumented and deprecated" );
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
}, "swap" );

if ( jQueryVersionSince( "3.4.0" ) && typeof Proxy !== "undefined" ) {
	jQuery.cssProps = new Proxy( jQuery.cssProps || {}, {
		set: function() {
			migrateWarn( "cssProps", "jQuery.cssProps is deprecated" );
			return Reflect.set.apply( this, arguments );
		}
	} );
}

// In jQuery >=4 where jQuery.cssNumber is missing fill it with the latest 3.x version:
// https://github.com/jquery/jquery/blob/3.6.0/src/css.js#L212-L233
// This way, number values for the CSS properties below won't start triggering
// Migrate warnings when jQuery gets updated to >=4.0.0 (gh-438).
if ( jQueryVersionSince( "4.0.0" ) && typeof Proxy !== "undefined" ) {
	jQuery.cssNumber = new Proxy( {
		animationIterationCount: true,
		columnCount: true,
		fillOpacity: true,
		flexGrow: true,
		flexShrink: true,
		fontWeight: true,
		gridArea: true,
		gridColumn: true,
		gridColumnEnd: true,
		gridColumnStart: true,
		gridRow: true,
		gridRowEnd: true,
		gridRowStart: true,
		lineHeight: true,
		opacity: true,
		order: true,
		orphans: true,
		widows: true,
		zIndex: true,
		zoom: true
	}, {
		get: function() {
			migrateWarn( "css-number", "jQuery.cssNumber is deprecated" );
			return Reflect.get.apply( this, arguments );
		},
		set: function() {
			migrateWarn( "css-number", "jQuery.cssNumber is deprecated" );
			return Reflect.set.apply( this, arguments );
		}
	} );
}

function isAutoPx( prop ) {

	// The first test is used to ensure that:
	// 1. The prop starts with a lowercase letter (as we uppercase it for the second regex).
	// 2. The prop is not empty.
	return ralphaStart.test( prop ) &&
		rautoPx.test( prop[ 0 ].toUpperCase() + prop.slice( 1 ) );
}

origFnCss = jQuery.fn.css;

migratePatchFunc( jQuery.fn, "css", function( name, value ) {
	var camelName,
		origThis = this;

	if ( name && typeof name === "object" && !Array.isArray( name ) ) {
		jQuery.each( name, function( n, v ) {
			jQuery.fn.css.call( origThis, n, v );
		} );
		return this;
	}

	if ( typeof value === "number" ) {
		camelName = camelCase( name );
		if ( !isAutoPx( camelName ) && !jQuery.cssNumber[ camelName ] ) {
			migrateWarn( "css-number",
				"Number-typed values are deprecated for jQuery.fn.css( \"" +
				name + "\", value )" );
		}
	}

	return origFnCss.apply( this, arguments );
}, "css-number" );

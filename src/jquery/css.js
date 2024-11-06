import { migrateWarn, migratePatchFunc } from "../main.js";
import { camelCase } from "../utils.js";

var origFnCss, internalCssNumber,
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

if ( typeof Proxy !== "undefined" ) {
	jQuery.cssProps = new Proxy( jQuery.cssProps || {}, {
		set: function() {
			migrateWarn( "cssProps", "jQuery.cssProps is removed" );
			return Reflect.set.apply( this, arguments );
		}
	} );
}

// `jQuery.cssNumber` is missing in jQuery >=4; fill it with the latest 3.x version:
// https://github.com/jquery/jquery/blob/3.7.1/src/css.js#L216-L246
// This way, number values for the CSS properties below won't start triggering
// Migrate warnings when jQuery gets updated to >=4.0.0 (gh-438).
//
// We need to keep this as a local variable as we need it internally
// in a `jQuery.fn.css` patch and this usage shouldn't warn.
internalCssNumber = {
	animationIterationCount: true,
	aspectRatio: true,
	borderImageSlice: true,
	columnCount: true,
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
	scale: true,
	widows: true,
	zIndex: true,
	zoom: true,

	// SVG-related
	fillOpacity: true,
	floodOpacity: true,
	stopOpacity: true,
	strokeMiterlimit: true,
	strokeOpacity: true
};

if ( typeof Proxy !== "undefined" ) {
	jQuery.cssNumber = new Proxy( internalCssNumber, {
		get: function() {
			migrateWarn( "css-number", "jQuery.cssNumber is deprecated" );
			return Reflect.get.apply( this, arguments );
		},
		set: function() {
			migrateWarn( "css-number", "jQuery.cssNumber is deprecated" );
			return Reflect.set.apply( this, arguments );
		}
	} );
} else {

	// Support: IE 9-11+
	// IE doesn't support proxies, but we still want to restore the legacy
	// jQuery.cssNumber there.
	jQuery.cssNumber = internalCssNumber;
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

		// Use `internalCssNumber` to avoid triggering our warnings in this
		// internal check.
		if ( !isAutoPx( camelName ) && !internalCssNumber[ camelName ] ) {
			migrateWarn( "css-number",
				"Auto-appending 'px' to number-typed values " +
					"for jQuery.fn.css( \"" + name + "\", value ) is removed" );
		}
	}

	return origFnCss.apply( this, arguments );
}, "css-number" );

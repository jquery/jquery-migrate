// A map from disabled patch codes to `true`. This should really
// be a `Set` but those are unsupported in IE.
var disabledPatches = Object.create( null );

// Don't apply patches for specified codes. Helpful for code bases
// where some Migrate warnings have been addressed and it's desirable
// to avoid needless patches or false positives.
jQuery.migrateDisablePatches = function() {
	var i;
	for ( i = 0; i < arguments.length; i++ ) {
		disabledPatches[ arguments[ i ] ] = true;
	}
};

// Allow enabling patches disabled via `jQuery.migrateDisablePatches`.
// Helpful if you want to disable a patch only for some code that won't
// be updated soon to be able to focus on other warnings - and enable it
// immediately after such a call:
// ```js
// jQuery.migrateDisablePatches( "workaroundA" );
// elem.pluginViolatingWarningA( "pluginMethod" );
// jQuery.migrateEnablePatches( "workaroundA" );
// ```
jQuery.migrateEnablePatches = function() {
	var i;
	for ( i = 0; i < arguments.length; i++ ) {
		delete disabledPatches[ arguments[ i ] ];
	}
};

jQuery.migrateIsPatchEnabled = function( patchCode ) {
	return !disabledPatches[ patchCode ];
};

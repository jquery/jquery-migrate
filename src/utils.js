import { migrateWarn } from "./main.js";

export function camelCase( string ) {
	return string.replace( /-([a-z])/g, function( _, letter ) {
		return letter.toUpperCase();
	} );
}

// Make `object` inherit from `Object.prototype` via an additional object
// in between; that intermediate object proxies properties
// to `Object.prototype`, warning about their usage first.
export function patchProto( object, options ) {
	var i,
		warningId = options.warningId,
		apiName = options.apiName,

		// `Object.prototype` keys are not enumerable so list the
		// official ones here. An alternative would be wrapping
		// objects with a Proxy but that creates additional issues
		// like breaking object identity on subsequent calls.
		objProtoKeys = [
			"__proto__",
			"__defineGetter__",
			"__defineSetter__",
			"__lookupGetter__",
			"__lookupSetter__",
			"hasOwnProperty",
			"isPrototypeOf",
			"propertyIsEnumerable",
			"toLocaleString",
			"toString",
			"valueOf"
		],

		// Use a null prototype at the beginning so that we can define our
		// `__proto__` getter & setter. We'll reset the prototype afterward.
		intermediateObj = Object.create( null );

	for ( i = 0; i < objProtoKeys.length; i++ ) {
		( function( key ) {
			Object.defineProperty( intermediateObj, key, {
				get: function() {
					migrateWarn( warningId,
						"Accessing properties from " + apiName +
						" inherited from Object.prototype is removed" );
					return ( key + "__cache" ) in intermediateObj ?
						intermediateObj[ key + "__cache" ] :
						Object.prototype[ key ];
				},
				set: function( value ) {
					migrateWarn( warningId,
						"Setting properties from " + apiName +
						" inherited from Object.prototype is removed" );
					intermediateObj[ key + "__cache" ] = value;
				}
			} );
		} )( objProtoKeys[ i ] );
	}

	Object.setPrototypeOf( intermediateObj, Object.prototype );
	Object.setPrototypeOf( object, intermediateObj );

	return object;
}

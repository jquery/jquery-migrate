import { migratePatchFunc, migrateWarn } from "../main.js";
import { camelCase } from "../utils.js";

var rmultiDash = /[A-Z]/g,
	rnothtmlwhite = /[^\x20\t\r\n\f]+/g,
	origJQueryData = jQuery.data;

function unCamelCase( str ) {
	return str.replace( rmultiDash, "-$&" ).toLowerCase();
}

function patchDataCamelCase( origData, options ) {
	var apiName = options.apiName,
		isInstanceMethod = options.isInstanceMethod;

	function objectSetter( elem, obj ) {
		var curData, key;

		// Name can be an object, and each entry in the object is meant
		// to be set as data.
		// Let the original method handle the case of a missing elem.
		if ( elem ) {

			// Don't use the instance method here to avoid `data-*` attributes
			// detection this early.
			curData = origJQueryData( elem );

			for ( key in obj ) {
				if ( key !== camelCase( key ) ) {
					migrateWarn( "data-camelCase",
						apiName + " always sets/gets camelCased names: " +
							key );
					curData[ key ] = obj[ key ];
				}
			}

			// Pass the keys handled above to the original API as well
			// so that both the camelCase & initial keys are saved.
			if ( isInstanceMethod ) {
				origData.call( this, obj );
			} else {
				origData.call( this, elem, obj );
			}

			return obj;
		}
	}

	function singleSetter( elem, name, value ) {
		var curData;

		// If the name is transformed, look for the un-transformed name
		// in the data object.
		// Let the original method handle the case of a missing elem.
		if ( elem ) {

			// Don't use the instance method here to avoid `data-*` attributes
			// detection this early.
			curData = origJQueryData( elem );

			if ( curData && name in curData ) {
				migrateWarn( "data-camelCase",
					apiName + " always sets/gets camelCased names: " +
						name );

				curData[ name ] = value;
			}

			origJQueryData( elem, name, value );

			// Since the "set" path can have two possible entry points
			// return the expected data based on which path was taken.
			return value !== undefined ? value : name;
		}
	}

	return function jQueryDataPatched( elem, name, value ) {
		var curData,
			that = this,

			// Support: IE 9 only
			// IE 9 doesn't support strict mode and later modifications of
			// parameters also modify the arguments object in sloppy mode.
			// We need the original arguments so save them here.
			args = Array.prototype.slice.call( arguments ),

			adjustedArgsLength = args.length;

		if ( isInstanceMethod ) {
			value = name;
			name = elem;
			elem = that[ 0 ];
			adjustedArgsLength++;
		}

		if ( name && typeof name === "object" && adjustedArgsLength === 2 ) {
			if ( isInstanceMethod ) {
				return that.each( function() {
					objectSetter.call( that, this, name );
				} );
			} else {
				return objectSetter.call( that, elem, name );
			}
		}

		// If the name is transformed, look for the un-transformed name
		// in the data object.
		// Let the original method handle the case of a missing elem.
		if ( name && typeof name === "string" && name !== camelCase( name ) &&
			adjustedArgsLength > 2 ) {

			if ( isInstanceMethod ) {
				return that.each( function() {
					singleSetter.call( that, this, name, value );
				} );
			} else {
				return singleSetter.call( that, elem, name, value );
			}
		}

		if ( elem && name && typeof name === "string" &&
			name !== camelCase( name ) &&
			adjustedArgsLength === 2 ) {

			// Don't use the instance method here to avoid `data-*` attributes
			// detection this early.
			curData = origJQueryData( elem );

			if ( curData && name in curData ) {
				migrateWarn( "data-camelCase",
					apiName + " always sets/gets camelCased names: " +
						name );
				return curData[ name ];
			}
		}

		return origData.apply( this, args );
	};
}

function patchRemoveDataCamelCase( origRemoveData, options ) {
	var isInstanceMethod = options.isInstanceMethod;

	function remove( elem, keys ) {
		var i, singleKey, unCamelCasedKeys,
			curData = jQuery.data( elem );

		if ( keys === undefined ) {
			origRemoveData( elem );
			return;
		}

		// Support array or space separated string of keys
		if ( !Array.isArray( keys ) ) {

			// If a key with the spaces exists, use it.
			// Otherwise, create an array by matching non-whitespace
			keys = keys in curData ?
				[ keys ] :
				( keys.match( rnothtmlwhite ) || [] );
		}

		// Remove:
		// * the original keys as passed
		// * their "unCamelCased" version
		// * their camelCase version
		// These may be three distinct values for each key!
		// jQuery 3.x only removes camelCase versions by default. However, in this patch
		// we set the original keys in the mass-setter case and if the key already exists
		// so without removing the "unCamelCased" versions the following would be broken:
		// ```js
		// elem.data( { "a-a": 1 } ).removeData( "aA" );
		// ```
		// Unfortunately, we'll still hit this issue for partially camelCased keys, e.g.:
		// ```js
		// elem.data( { "a-aA": 1 } ).removeData( "aAA" );
		// ```
		// won't work with this patch. We consider this an edge case, but to make sure that
		// at least piggybacking works:
		// ```js
		// elem.data( { "a-aA": 1 } ).removeData( "a-aA" );
		// ```
		// we also remove the original key. Hence, all three are needed.
		// The original API already removes the camelCase versions, though, so let's defer
		// to it.
		unCamelCasedKeys = keys.map( unCamelCase );

		i = keys.length;
		while ( i-- ) {
			singleKey = keys[ i ];
			if ( singleKey !== camelCase( singleKey ) && singleKey in curData ) {
				migrateWarn( "data-camelCase",
					"jQuery" + ( isInstanceMethod ? ".fn" : "" ) +
					".data() always sets/gets camelCased names: " +
					singleKey );
			}
			delete curData[ singleKey ];
		}

		// Don't warn when removing "unCamelCased" keys; we're already printing
		// a warning when setting them and the fix is needed there, not in
		// the `.removeData()` call.
		i = unCamelCasedKeys.length;
		while ( i-- ) {
			delete curData[ unCamelCasedKeys[ i ] ];
		}

		origRemoveData( elem, keys );
	}

	return function jQueryRemoveDataPatched( elem, key ) {
		if ( isInstanceMethod ) {
			key = elem;
			return this.each( function() {
				remove( this, key );
			} );
		} else {
			remove( elem, key );
		}
	};
}

migratePatchFunc( jQuery, "data",
	patchDataCamelCase( jQuery.data, {
		apiName: "jQuery.data()",
		isInstanceMethod: false
	} ),
	"data-camelCase" );
migratePatchFunc( jQuery.fn, "data",
	patchDataCamelCase( jQuery.fn.data, {
		apiName: "jQuery.fn.data()",
		isInstanceMethod: true
	} ),
	"data-camelCase" );

migratePatchFunc( jQuery, "removeData",
	patchRemoveDataCamelCase( jQuery.removeData, {
		isInstanceMethod: false
	} ),
	"data-camelCase" );

migratePatchFunc( jQuery.fn, "removeData",

	// No, it's not a typo - we're intentionally passing
	// the static method here as we need something working on
	// a single element.
	patchRemoveDataCamelCase( jQuery.removeData, {
		isInstanceMethod: true
	} ),
	"data-camelCase" );


function patchDataProto( original, options ) {

	// Support: IE 9 - 10 only, iOS 7 - 8 only
	// Older IE doesn't have a way to change an existing prototype.
	// Just return the original method there.
	// Older WebKit supports `__proto__` but not `Object.setPrototypeOf`.
	// To avoid complicating code, don't patch the API there either.
	if ( !Object.setPrototypeOf ) {
		return original;
	}

	var i,
		apiName = options.apiName,
		isInstanceMethod = options.isInstanceMethod,

		// `Object.prototype` keys are not enumerable so list the
		// official ones here. An alternative would be wrapping
		// data objects with a Proxy but that creates additional issues
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
		// `__proto__` getter & setter. We'll reset the prototype afterwards.
		intermediateDataObj = Object.create( null );

	for ( i = 0; i < objProtoKeys.length; i++ ) {
		( function( key ) {
			Object.defineProperty( intermediateDataObj, key, {
				get: function() {
					migrateWarn( "data-null-proto",
						"Accessing properties from " + apiName +
						" inherited from Object.prototype is deprecated" );
					return ( key + "__cache" ) in intermediateDataObj ?
						intermediateDataObj[ key + "__cache" ] :
						Object.prototype[ key ];
				},
				set: function( value ) {
					migrateWarn( "data-null-proto",
						"Setting properties from " + apiName +
						" inherited from Object.prototype is deprecated" );
					intermediateDataObj[ key + "__cache" ] = value;
				}
			} );
		} )( objProtoKeys[ i ] );
	}

	Object.setPrototypeOf( intermediateDataObj, Object.prototype );

	return function jQueryDataProtoPatched() {
		var result = original.apply( this, arguments );

		if ( arguments.length !== ( isInstanceMethod ? 0 : 1 ) || result === undefined ) {
			return result;
		}

		// Insert an additional object in the prototype chain between `result`
		// and `Object.prototype`; that intermediate object proxies properties
		// to `Object.prototype`, warning about their usage first.
		Object.setPrototypeOf( result, intermediateDataObj );

		return result;
	};
}

// Yes, we are patching jQuery.data twice; here & above. This is necessary
// so that each of the two patches can be independently disabled.
migratePatchFunc( jQuery, "data",
	patchDataProto( jQuery.data, {
		apiName: "jQuery.data()",
		isPrivateData: false,
		isInstanceMethod: false
	} ),
	"data-null-proto" );
migratePatchFunc( jQuery.fn, "data",
	patchDataProto( jQuery.fn.data, {
		apiName: "jQuery.fn.data()",
		isPrivateData: true,
		isInstanceMethod: true
	} ),
	"data-null-proto" );

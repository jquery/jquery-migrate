import { migratePatchFunc, migrateWarn } from "../main.js";
import { camelCase, patchProto } from "../utils.js";

var rmultiDash = /[A-Z]/g,
	rnothtmlwhite = /[^\x20\t\r\n\f]+/g,
	origJQueryData = jQuery.data,
	origJQueryPrivateData = jQuery._data;

function unCamelCase( str ) {
	return str.replace( rmultiDash, "-$&" ).toLowerCase();
}

function patchDataCamelCase( origData, options ) {
	var apiName = options.apiName,
		isPrivateData = options.isPrivateData,
		isInstanceMethod = options.isInstanceMethod,
		origJQueryStaticData = isPrivateData ? origJQueryPrivateData : origJQueryData;

	function objectSetter( elem, obj ) {
		var curData, key;

		// Name can be an object, and each entry in the object is meant
		// to be set as data.
		// Let the original method handle the case of a missing elem.
		if ( elem ) {

			// Don't use the instance method here to avoid `data-*` attributes
			// detection this early.
			curData = origJQueryStaticData( elem );

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
			curData = origJQueryStaticData( elem );

			if ( curData && name in curData ) {
				migrateWarn( "data-camelCase",
					apiName + " always sets/gets camelCased names: " +
						name );

				curData[ name ] = value;
			}

			origJQueryStaticData( elem, name, value );

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
			curData = origJQueryStaticData( elem );

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
	var isPrivateData = options.isPrivateData,
		isInstanceMethod = options.isInstanceMethod,
		origJQueryStaticData = isPrivateData ? origJQueryPrivateData : origJQueryData;

	function remove( elem, keys ) {
		var i, singleKey, unCamelCasedKeys,
			curData = origJQueryStaticData( elem );

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
		isPrivateData: false,
		isInstanceMethod: false
	} ),
	"data-camelCase" );
migratePatchFunc( jQuery, "_data",
	patchDataCamelCase( jQuery._data, {
		apiName: "jQuery._data()",
		isPrivateData: true,
		isInstanceMethod: false
	} ),
	"data-camelCase" );
migratePatchFunc( jQuery.fn, "data",
	patchDataCamelCase( jQuery.fn.data, {
		apiName: "jQuery.fn.data()",
		isPrivateData: false,
		isInstanceMethod: true
	} ),
	"data-camelCase" );

migratePatchFunc( jQuery, "removeData",
	patchRemoveDataCamelCase( jQuery.removeData, {
		isPrivateData: false,
		isInstanceMethod: false
	} ),
	"data-camelCase" );
migratePatchFunc( jQuery, "_removeData",
	patchRemoveDataCamelCase( jQuery._removeData, {
		isPrivateData: true,
		isInstanceMethod: false
	} ),
	"data-camelCase" );
migratePatchFunc( jQuery.fn, "removeData",

	// No, it's not a typo - we're intentionally passing
	// the static method here as we need something working on
	// a single element.
	patchRemoveDataCamelCase( jQuery.removeData, {
		isPrivateData: false,
		isInstanceMethod: true
	} ),
	"data-camelCase" );

function patchDataProto( original, options ) {
	var warningId = options.warningId,
		apiName = options.apiName,
		isInstanceMethod = options.isInstanceMethod;

	return function apiWithProtoPatched() {
		var result = original.apply( this, arguments );

		if ( arguments.length !== ( isInstanceMethod ? 0 : 1 ) || result === undefined ) {
			return result;
		}

		patchProto( result, {
			warningId: warningId,
			apiName: apiName
		} );

		return result;
	};
}

// Yes, we are patching jQuery.data twice; here & above. This is necessary
// so that each of the two patches can be independently disabled.
migratePatchFunc( jQuery, "data",
	patchDataProto( jQuery.data, {
		warningId: "data-null-proto",
		apiName: "jQuery.data()",
		isInstanceMethod: false
	} ),
	"data-null-proto" );
migratePatchFunc( jQuery, "_data",
	patchDataProto( jQuery._data, {
		warningId: "data-null-proto",
		apiName: "jQuery._data()",
		isInstanceMethod: false
	} ),
	"data-null-proto" );
migratePatchFunc( jQuery.fn, "data",
	patchDataProto( jQuery.fn.data, {
		warningId: "data-null-proto",
		apiName: "jQuery.fn.data()",
		isInstanceMethod: true
	} ),
	"data-null-proto" );

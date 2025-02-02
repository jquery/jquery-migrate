import { migratePatchFunc, migrateWarn } from "../main.js";

function patchDataProto( original, options ) {
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
						" inherited from Object.prototype is removed" );
					return ( key + "__cache" ) in intermediateDataObj ?
						intermediateDataObj[ key + "__cache" ] :
						Object.prototype[ key ];
				},
				set: function( value ) {
					migrateWarn( "data-null-proto",
						"Setting properties from " + apiName +
						" inherited from Object.prototype is removed" );
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

// TODO entry in warnings.md

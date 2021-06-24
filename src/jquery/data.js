import { migrateWarn } from "../main.js";
import { camelCase } from "../utils.js";

var oldData = jQuery.data;
var oldFnData = jQuery.fn.data;

jQuery.data = function( elem, name, value ) {
	var curData, sameKeys, key;

	// Name can be an object, and each entry in the object is meant to be set as data
	if ( name && typeof name === "object" && arguments.length === 2 ) {
		curData = jQuery.hasData( elem ) && oldData.call( this, elem );
		sameKeys = {};
		for ( key in name ) {
			if ( key !== camelCase( key ) ) {
				migrateWarn( "jQuery.data() always sets/gets camelCased names: " + key );
				curData[ key ] = name[ key ];
			} else {
				sameKeys[ key ] = name[ key ];
			}
		}

		oldData.call( this, elem, sameKeys );

		return name;
	}

	// If the name is transformed, look for the un-transformed name in the data object
	if ( name && typeof name === "string" && name !== camelCase( name ) ) {
		curData = jQuery.hasData( elem ) && oldData.call( this, elem );
		if ( curData && name in curData ) {
			migrateWarn( "jQuery.data() always sets/gets camelCased names: " + name );
			if ( arguments.length > 2 ) {
				curData[ name ] = value;
			}
			return curData[ name ];
		}
	}

	return oldData.apply( this, arguments );
};

jQuery.fn.extend({
    data: function(key, value) {
        if (arguments.length === 0 && typeof Proxy !== 'undefined') {
            var result = oldFnData.call(this);
            return new Proxy(result, {
                get: function(target, prop) {
                    if (
                        prop !== camelCase(prop) &&
                        target[prop] === undefined
                    ) {
                        migrateWarn(
                            'jQuery.data() always sets/gets camelCased names: ' +
                                prop
                        );
                        return target[camelCase(prop)];
                    }
                    return target[prop];
                }
            });
        }
        if (arguments.length > 0 && typeof key === 'string' && key !== camelCase(key)) {
            migrateWarn(
                'jQuery.data() always sets/gets camelCased names: ' + key
            );
            var args =
                arguments.length > 1
                    ? [camelCase(key), value]
                    : [camelCase(key)];
            return oldFnData.apply(this, args);
        }
        return oldFnData.apply(this, arguments);
    }
});

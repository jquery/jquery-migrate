import { migratePatchFunc, migrateWarn } from "../main.js";
import { camelCase } from "../utils.js";

var origData = jQuery.data;

migratePatchFunc( jQuery, "data", function( elem, name, value ) {
	var curData, sameKeys, key;

	// Name can be an object, and each entry in the object is meant to be set as data
	if ( name && typeof name === "object" && arguments.length === 2 ) {

		curData = jQuery.hasData( elem ) && origData.call( this, elem );
		sameKeys = {};
		for ( key in name ) {
			if ( key !== camelCase( key ) ) {
				migrateWarn( "data-camelCase",
					"jQuery.data() always sets/gets camelCased names: " + key );
				curData[ key ] = name[ key ];
			} else {
				sameKeys[ key ] = name[ key ];
			}
		}

		origData.call( this, elem, sameKeys );

		return name;
	}

	// If the name is transformed, look for the un-transformed name in the data object
	if ( name && typeof name === "string" && name !== camelCase( name ) ) {

		curData = jQuery.hasData( elem ) && origData.call( this, elem );
		if ( curData && name in curData ) {
			migrateWarn( "data-camelCase",
				"jQuery.data() always sets/gets camelCased names: " + name );
			if ( arguments.length > 2 ) {
				curData[ name ] = value;
			}
			return curData[ name ];
		}
	}

	return origData.apply( this, arguments );
}, "data-camelCase" );

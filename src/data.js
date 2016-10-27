var oldData = jQuery.data;

jQuery.data = function( elem, name, value ) {
	var curData;
	
	//name can be an object, and each entry in the object is meant to be set as data
	if ( name && typeof name === "object" && arguments.length === 2 ) {
		for ( var key in name ) {
			if ( key !== jQuery.camelCase( key ) ){
				migrateWarn( "jQuery.data() always sets/gets camelCased names: " + key );
			}
		}
		
		//jQuery.data will convert keys to camelCase, and this is a setter.	
		return oldData.apply( this, arguments );
	}

	// If the name is transformed, look for the un-transformed name in the data object
	if ( name && typeof name === "string" && name !== jQuery.camelCase( name ) ) {
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

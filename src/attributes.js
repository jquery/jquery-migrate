
var attrFn = {},
	attr = jQuery.attr,
	valueAttrGet = jQuery.attrHooks.value && jQuery.attrHooks.value.get ||
		function() { return null; },
	valueAttrSet = jQuery.attrHooks.value && jQuery.attrHooks.value.set ||
		function() { return undefined; },
	rnoType = /^(?:input|button)$/i,
	rnoAttrNodeType = /^[238]$/;

// jQuery.attrFn
migrateWarnProp( jQuery, "attrFn", attrFn, "jQuery.attrFn is deprecated" );

jQuery.attr = function( elem, name, value, pass ) {
	if ( pass ) {
		migrateWarn("jQuery.fn.attr( props, pass ) is deprecated");
		if ( elem && !rnoAttrNodeType.test( elem.nodeType ) && jQuery.isFunction( jQuery.fn[ name ] ) ) {
			return jQuery( elem )[ name ]( value );
		}
	}

	// Warn if user tries to set `type` since it breaks on IE 6/7/8
	if ( name === "type" && value !== undefined && rnoType.test( elem.nodeName ) ) {
		migrateWarn("Can't change the 'type' of an input or button in IE 6/7/8");
	}

	return attr.call( jQuery, elem, name, value );
};

// attrHooks: value
jQuery.attrHooks.value = {
	get: function( elem, name ) {
		if ( jQuery.nodeName( elem, "button" ) ) {
			return valueAttrGet.apply( this, arguments );
		}
		migrateWarn("property-based jQuery.fn.attr('value') is deprecated");
		return name in elem ?
			elem.value :
			null;
	},
	set: function( elem, value, name ) {
		if ( jQuery.nodeName( elem, "button" ) ) {
			return valueAttrSet.apply( this, arguments );
		}
		migrateWarn("property-based jQuery.fn.attr('value', val) is deprecated");
		// Does not return so that setAttribute is also used
		elem.value = value;
	}
};

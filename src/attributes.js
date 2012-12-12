
var attrFn = {},
	attr = jQuery.attr,
	rnoType = /^(?:input|button)$/i,
	rnoAttrNodeType = /^[238]$/;

// jQuery.attrFn
if ( JQCOMPAT_WARN ) {
	compatWarnProp( jQuery, "attrFn", attrFn, "jQuery.attrFn is deprecated" );
}

jQuery.attr = function( elem, name, value, pass ) {
	if ( pass ) {
		if ( JQCOMPAT_WARN ) {
			compatWarn("jQuery.fn.attr( props, pass ) is deprecated");
		}
		if ( elem && !rnoAttrNodeType.test( elem.nodeType ) && jQuery.isFunction( jQuery.fn[ name ] ) ) {
			return jQuery( elem )[ name ]( value );
		}
	}

	// Warn if user tries to set `type` since it breaks on IE 6/7/8
	if ( JQCOMPAT_WARN && name === "type" && value !== undefined && rnoType.test( elem.nodeName ) ) {
		compatWarn("Can't change the 'type' of an input or button in IE 6/7/8");
	}

	return attr.call( jQuery, elem, name, value );
};

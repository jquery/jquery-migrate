// jQuery.attrFn
var attrFn = {},
	attr = jQuery.attr,
	rnoAttrNodeType = /^[238]$/;

if ( JQCOMPAT_WARN ) {
	compatWarnProp( jQuery, "attrFn", attrFn, "jQuery.attrFn is deprecated" );
}

// .attr( attrs, true )
jQuery.attr = function( elem, name, value, pass ) {
	if ( pass ) {
		if ( JQCOMPAT_WARN ) {
			compatWarn("jQuery.fn.attr( props, pass ) is deprecated");
		}
		if ( elem && !rnoAttrNodeType.test( elem.nodeType ) && jQuery.isFunction( jQuery.fn[ name ] ) ) {
			return jQuery( elem )[ name ]( value );
		}
	}
	return attr.call( jQuery, elem, name, value );
};

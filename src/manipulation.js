
var oldSelf = jQuery.fn.andSelf || jQuery.fn.addBack;

jQuery.fn.andSelf = function() {
	migrateWarn("jQuery.fn.andSelf() replaced by jQuery.fn.addBack()");
	return oldSelf.apply( this, arguments );
};

// Since jQuery.clean is used internally on older versions, we only shim if it's missing
if ( !jQuery.clean ) {
	jQuery.clean = function( elems, context, fragment, scripts, selection ) {
		var newFragment = jQuery.buildFragment( elems, context || document, scripts, selection );

		migrateWarn("jQuery.clean() is deprecated");
		if ( fragment ) {
			fragment.appendChild( newFragment );

		} else {
			fragment = newFragment;
		}

		return jQuery.merge( [], fragment.childNodes );
	};
}


var oldSelf = jQuery.fn.andSelf || jQuery.fn.addBack,
	oldFragment = jQuery.buildFragment;

jQuery.fn.andSelf = function() {
	compatWarn("jQuery.fn.andSelf() replaced by jQuery.fn.addBack()");
	return oldSelf.apply( this, arguments );
};

jQuery.buildFragment = function( args, context, scripts ) {
	var fragment;

	if ( !oldFragment ) {
		// Set context from what may come in as undefined or a jQuery collection or a node
		// Updated to fix #12266 where accessing context[0] could throw an exception in IE9/10 &
		// also doubles as fix for #8950 where plain objects caused createDocumentFragment exception
		context = context || document;
		context = !context.nodeType && context[0] || context;
		context = context.ownerDocument || context;

		fragment = context.createDocumentFragment();
		jQuery.clean( args, context, fragment, scripts );

		compatWarn("jQuery.buildFragment() is deprecated");
		return { fragment: fragment, cacheable: false };
	}
	// Don't warn if we are in a version where buildFragment is used internally
	return oldFragment.apply( this, arguments );
};

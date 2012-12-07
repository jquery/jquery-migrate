
jQuery.buildFragment = function( args, context, scripts ) {
	var fragment;

	compatWarn("jQuery.buildFragment() is deprecated");

	// Set context from what may come in as undefined or a jQuery collection or a node
	// Updated to fix #12266 where accessing context[0] could throw an exception in IE9/10 &
	// also doubles as fix for #8950 where plain objects caused createDocumentFragment exception
	context = context || document;
	context = !context.nodeType && context[0] || context;
	context = context.ownerDocument || context;

	fragment = context.createDocumentFragment();
	jQuery.clean( args, context, fragment, scripts );

	return fragment;
};

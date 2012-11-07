
var eventAdd = jQuery.event.add,
	eventRemove = jQuery.event.remove,
	oldToggle = jQuery.event.toggle,
	rhoverHack = /(?:^|\s)hover(\.\S+|)\b/,
	hoverHack = function( events ) {
		if ( jQuery.event.special.hover ) {
			return events;
		}
		if ( rhoverHack.test( events ) ) {
			compatWarn( "'hover' pseudo-event is deprecated, use 'mouseenter mouseleave'" );
		}
		return events && events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
	};

// Support for 'hover' pseudo-event
jQuery.event.add = function( elem, types, handler, data, selector ){
	eventAdd.call( this, elem, hoverHack( types || "" ), handler, data, selector );
};
jQuery.event.remove = function( elem, types, handler, selector, mappedTypes ){
	eventRemove.call( this, elem, hoverHack( types ) || "", handler, selector, mappedTypes );
};

jQuery.fn.error = function( data, fn ) {
	compatWarn( "jQuery.fn.error() is deprecated" );
	return arguments.length ? this.bind( "error", data, fn ) : this.trigger("error");
};

jQuery.fn.toggle = function( fn, fn2 ) {

	// Don't mess with animation or css toggles
	if ( !jQuery.isFunction( fn ) || !jQuery.isFunction( fn2 ) ) {
		return oldToggle.apply( this, arguments );
	}
	compatWarn( "jQuery.fn.toggle(handler, handler...) is deprecated" );

	// Save reference to arguments for access in closure
	var args = arguments,
		guid = fn.guid || jQuery.guid++,
		i = 0,
		toggler = function( event ) {
			// Figure out which function to execute
			var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
			jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

			// Make sure that clicks stop
			event.preventDefault();

			// and execute the function
			return args[ lastToggle ].apply( this, arguments ) || false;
		};

	// link all the functions, so any of them can unbind this click handler
	toggler.guid = guid;
	while ( i < args.length ) {
		args[ i++ ].guid = guid;
	}

	return this.click( toggler );
};

jQuery.fn.live = function( types, data, fn ) {
	compatWarn( "jQuery.fn.live() is deprecated" );
	jQuery( this.context ).on( types, this.selector, data, fn );
	return this;
};
jQuery.fn.die = function( types, fn ) {
	compatWarn( "jQuery.fn.die() is deprecated" );
	jQuery( this.context ).off( types, this.selector || "**", fn );
	return this;
};

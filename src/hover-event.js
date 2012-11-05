
// Support for 'hover' pseudo-event
var eventAdd = jQuery.event.add,
	eventRemove = jQuery.event.remove,
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

jQuery.event.add = function( elem, types, handler, data, selector ){
	eventAdd.call( this, elem, hoverHack( types || "" ), handler, data, selector );
};

jQuery.event.remove = function( elem, types, handler, selector, mappedTypes ){
	eventRemove.call( this, elem, hoverHack( types ) || "", handler, selector, mappedTypes );
};

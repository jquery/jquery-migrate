
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

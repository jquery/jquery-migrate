jQuery.fn.andSelf = function() {
	migrateWarn( "jQuery.fn.andSelf is deprecated; use jQuery.fn.addBack" );
	return jQuery.fn.addBack.apply( this, arguments );
};

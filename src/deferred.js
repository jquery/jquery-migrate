
var oldDeferred = jQuery.Deferred;

jQuery.Deferred = function() {
	var deferred = oldDeferred.apply( this, arguments );

	deferred.pipe = function() {
		migrateWarn( "deferred.pipe() is deprecated" );
		return deferred.then.apply( this, arguments );
	};
	
	return deferred;
};

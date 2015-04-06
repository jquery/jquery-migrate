
var oldDeferred = jQuery.Deferred;

jQuery.Deferred = function() {
	var deferred = oldDeferred.apply( this, arguments );

	// Don't add this method if the current jQuery doesn't provide it
	if ( deferred.pipe ) {

		deferred.pipe = function() {
			migrateWarn( "deferred.pipe() is deprecated" );
			return deferred.then.apply( this, arguments );
		};

		deferred.promise().pipe = function() {
			return deferred.pipe.apply( this, arguments );
		};
	}

	return deferred;
};

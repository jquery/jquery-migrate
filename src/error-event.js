
// jQuery.fn.error attaches/fires an "error" event but doesn't work on window
jQuery.fn.error = function( data, fn ) {
	compatWarn( "jQuery.fn.error() is deprecated" );
	return arguments.length ? this.bind( "error", data, fn ) : this.trigger("error");
};

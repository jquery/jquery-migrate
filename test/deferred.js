
module("deferred");

test( ".pipe()", function() {
	expect( 4 );

	var d = jQuery.Deferred().resolve( 1 );

	expectNoWarning( "then", function() {
		d.then(function( v ) {
			equal( v, 1, "got correct value" );
		});	});

	expectWarning( "pipe", function() {
		d.pipe(function( v ) {
			equal( v, 1, "got correct value" );
		});
	});
		
});



module("deferred");

test( ".pipe()", function() {
	expect( 8 );

	var d = jQuery.Deferred().resolve( 1 );

	// Deferred
	expectNoWarning( "then", function() {
		d.then(function( v ) {
			equal( v, 1, "got correct value" );
		});	});

	expectWarning( "pipe", function() {
		d.pipe(function( v ) {
			equal( v, 1, "got correct value" );
		});
	});

	// Deferred's promise object
	d = d.promise();
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


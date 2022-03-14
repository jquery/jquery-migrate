// Support jQuery slim which excludes the deferred module in jQuery 4.0+
if ( jQuery.Deferred ) {

QUnit.module( "deferred" );

QUnit.test( "jQuery.Deferred.exceptionHook", function( assert ) {
	assert.expect( 1 );

	// Make sure our shimming didn't clobber the default hook
	assert.ok( typeof jQuery.Deferred.exceptionHook === "function", "hook is present" );
} );

QUnit.test( ".pipe() warnings", function( assert ) {
	assert.expect( 4 );

	var d = jQuery.Deferred(),
		p = d.promise();

	function checkValue( v ) {
		assert.equal( v, 1, "got correct value" );
	}

	// Deferred
	expectWarning( assert, "pipe", function() {
		d.pipe( checkValue );
	} );

	// Deferred's promise object
	expectWarning( assert, "pipe", function() {
		p.pipe( checkValue );
	} );

	// Should happen synchronously for .pipe()
	d.resolve( 1 );
} );

QUnit.test( "[PIPE ONLY] jQuery.Deferred.pipe - filtering (fail)", function( assert ) {

	assert.expect( 4 );

	var value1, value2, value3,
		defer = jQuery.Deferred(),
		piped = defer.pipe( null, function( a, b ) {
			return a * b;
		} ),
		done = jQuery.map( new Array( 3 ), function() {
			return assert.async();
		} );

	piped.fail( function( result ) {
		value3 = result;
	} );

	defer.fail( function( a, b ) {
		value1 = a;
		value2 = b;
	} );

	defer.reject( 2, 3 ).pipe( null, function() {
		assert.strictEqual( value1, 2, "first reject value ok" );
		assert.strictEqual( value2, 3, "second reject value ok" );
		assert.strictEqual( value3, 6, "result of filter ok" );
		done.pop().call();
	} );

	jQuery.Deferred().resolve().pipe( null, function() {
		assert.ok( false, "then should not be called on resolve" );
	} ).then( done.pop() );

	jQuery.Deferred().reject().pipe( null, jQuery.noop ).fail( function( value ) {
		assert.strictEqual( value, undefined, "then fail callback can return undefined/null" );
		done.pop().call();
	} );
} );

QUnit.test( "[PIPE ONLY] jQuery.Deferred.pipe - deferred (progress)", function( assert ) {

	assert.expect( 3 );

	var value1, value2, value3,
		defer = jQuery.Deferred(),
		piped = defer.pipe( null, null, function( a, b ) {
			return jQuery.Deferred( function( defer ) {
				defer.resolve( a * b );
			} );
		} ),
		done = assert.async();

	piped.done( function( result ) {
		value3 = result;
	} );

	defer.progress( function( a, b ) {
		value1 = a;
		value2 = b;
	} );

	defer.notify( 2, 3 );

	piped.done( function() {
		assert.strictEqual( value1, 2, "first progress value ok" );
		assert.strictEqual( value2, 3, "second progress value ok" );
		assert.strictEqual( value3, 6, "result of filter ok" );
		done();
	} );
} );

QUnit.test( "[PIPE ONLY] jQuery.Deferred.pipe - context", function( assert ) {

	assert.expect( 5 );

	var defer, piped, defer2, piped2,
		context = {},
		done = jQuery.map( new Array( 4 ), function() {
			return assert.async();
		} );

	jQuery.Deferred().resolveWith( context, [ 2 ] ).pipe( function( value ) {
		return value * 3;
	} ).done( function( value ) {
		assert.strictEqual( this, context, "[PIPE ONLY] custom context correctly propagated" );
		assert.strictEqual( value, 6, "proper value received" );
		done.pop().call();
	} );

	jQuery.Deferred().resolve().pipe( function() {
		return jQuery.Deferred().resolveWith( context );
	} ).done( function() {
		assert.strictEqual( this, context,
			"custom context of returned deferred correctly propagated" );
		done.pop().call();
	} );

	defer = jQuery.Deferred();
	piped = defer.pipe( function( value ) {
		return value * 3;
	} );

	defer.resolve( 2 );

	piped.done( function( value ) {

		// `this` result changed between 1.8 and 1.9, so don't check it
		assert.strictEqual( value, 6, "proper value received" );
		done.pop().call();
	} );

	defer2 = jQuery.Deferred();
	piped2 = defer2.pipe();

	defer2.resolve( 2 );

	piped2.done( function( value ) {

		// `this` result changed between 1.8 and 1.9, so don't check it
		assert.strictEqual( value, 2, "proper value received (without passing function)" );
		done.pop().call();
	} );
} );

}

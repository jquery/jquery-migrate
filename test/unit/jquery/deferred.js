// Support jQuery slim which excludes the deferred module in jQuery 4.0+
if ( jQuery.Deferred ) {

QUnit.module( "deferred", {
	beforeEach: function() {
		this.sandbox = sinon.createSandbox();
	},
	afterEach: function() {
		this.sandbox.restore();
		jQuery.Deferred.getErrorHook = jQuery.Deferred.getStackHook = undefined;
	}
} );

QUnit.test( "jQuery.Deferred.exceptionHook", function( assert ) {
	assert.expect( 1 );

	// Make sure our shimming didn't clobber the default hook
	assert.ok( typeof jQuery.Deferred.exceptionHook === "function", "hook is present" );
} );

QUnit.test( "jQuery.Deferred.getStackHook - getter", function( assert ) {
	assert.expect( 5 );

	var exceptionHookSpy,
		done = assert.async();

	// Source: https://github.com/dmethvin/jquery-deferred-reporter
	function getErrorHook() {

		// Throw an error as IE doesn't capture `stack` of non-thrown ones.
		try {
			throw new Error( "Test exception in jQuery.Deferred" );
		} catch ( err ) {
			return err;
		}
	}

	jQuery.Deferred.getErrorHook = getErrorHook;

	exceptionHookSpy = this.sandbox.spy( jQuery.Deferred, "exceptionHook" );

	expectMessage( assert, "jQuery.Deferred.getStackHook - getter", 1, function() {
		assert.strictEqual( jQuery.Deferred.getStackHook, jQuery.Deferred.getErrorHook,
			"getStackHook mirrors getErrorHook (getter)" );
	} );

	expectNoMessage( assert, "asyncHook reported in jQuery.Deferred.exceptionHook", function() {
		jQuery
			.when()
			.then( function() {
				throw new ReferenceError( "Test ReferenceError" );
			} )
			.catch( function() {
				var asyncError = exceptionHookSpy.lastCall.args[ 1 ];
				assert.ok( asyncError instanceof Error,
					"Error passed to exceptionHook (instance)" );
				assert.strictEqual( asyncError.message, "Test exception in jQuery.Deferred",
					"Error passed to exceptionHook (message)" );
				done();
			} );
	} );
} );

QUnit.test( "jQuery.Deferred.getStackHook - getter, no getErrorHook", function( assert ) {
	assert.expect( 1 );

	var done = assert.async();

	expectNoMessage( assert, "No Migrate warning in a regular `then`", function() {
		jQuery
			.when()
			.then( function() {
				done();
			} );
	} );
} );

QUnit.test( "jQuery.Deferred.getStackHook - setter", function( assert ) {
	assert.expect( 6 );

	var exceptionHookSpy,
		done = assert.async();

	exceptionHookSpy = this.sandbox.spy( jQuery.Deferred, "exceptionHook" );

	expectMessage( assert, "jQuery.Deferred.getStackHook - setter", 1, function() {
		var mockFn = function() {};
		jQuery.Deferred.getStackHook = mockFn;
		assert.strictEqual( jQuery.Deferred.getErrorHook, mockFn,
			"getStackHook mirrors getErrorHook (setter)" );
	} );

	expectNoMessage( assert, "jQuery.Deferred.getStackHook - setter", 1, function() {
		var mockFn = function() {};
		jQuery.Deferred.getStackHook = jQuery.Deferred.getErrorHook = mockFn;
	} );

	expectMessage( assert, "asyncHook from jQuery.Deferred.getStackHook reported",
			1, function() {
		jQuery.Deferred.getStackHook = function() {

			// Throw an error as IE doesn't capture `stack` of non-thrown ones.
			try {
				throw new SyntaxError( "Different exception in jQuery.Deferred" );
			} catch ( err ) {
				return err;
			}
		};

		jQuery
			.when()
			.then( function() {
				throw new ReferenceError( "Test ReferenceError" );
			} )
			.catch( function() {
				var asyncError = exceptionHookSpy.lastCall.args[ 1 ];
				assert.ok( asyncError instanceof SyntaxError,
					"Error passed to exceptionHook (instance)" );
				assert.strictEqual( asyncError.message, "Different exception in jQuery.Deferred",
					"Error passed to exceptionHook (message)" );

				done();
			} );
	} );
} );

QUnit.test( "jQuery.Deferred.getStackHook - disabled patch, getter", function( assert ) {
	assert.expect( 5 );

	var exceptionHookSpy,
		done = assert.async();

	// Source: https://github.com/dmethvin/jquery-deferred-reporter
	function getErrorHook() {

		// Throw an error as IE doesn't capture `stack` of non-thrown ones.
		try {
			throw new Error( "Test exception in jQuery.Deferred" );
		} catch ( err ) {
			return err;
		}
	}

	jQuery.migrateDisablePatches( "deferred-getStackHook" );

	jQuery.Deferred.getErrorHook = getErrorHook;

	exceptionHookSpy = this.sandbox.spy( jQuery.Deferred, "exceptionHook" );

	expectNoMessage( assert, "jQuery.Deferred.getStackHook - getter", function() {
		assert.strictEqual( jQuery.Deferred.getStackHook, undefined,
			"getStackHook does not mirror getErrorHook (getter)" );
	} );

	expectNoMessage( assert, "asyncHook reported in jQuery.Deferred.exceptionHook", function() {
		jQuery
			.when()
			.then( function() {
				throw new ReferenceError( "Test ReferenceError" );
			} )
			.catch( function() {
				var asyncError = exceptionHookSpy.lastCall.args[ 1 ];
				assert.ok( asyncError instanceof Error,
					"Error passed to exceptionHook (instance)" );
				assert.strictEqual( asyncError.message, "Test exception in jQuery.Deferred",
					"Error passed to exceptionHook (message)" );
				done();
			} );
	} );
} );

QUnit.test( "jQuery.Deferred.getStackHook - disabled patch, setter", function( assert ) {
	assert.expect( 4 );

	var exceptionHookSpy,
		done = assert.async();

	// Source: https://github.com/dmethvin/jquery-deferred-reporter
	function getErrorHook() {

		// Throw an error as IE doesn't capture `stack` of non-thrown ones.
		try {
			throw new Error( "Test exception in jQuery.Deferred" );
		} catch ( err ) {
			return err;
		}
	}

	jQuery.migrateDisablePatches( "deferred-getStackHook" );

	jQuery.Deferred.getErrorHook = getErrorHook;

	exceptionHookSpy = this.sandbox.spy( jQuery.Deferred, "exceptionHook" );

	expectNoMessage( assert, "jQuery.Deferred.getStackHook - setter", function() {
		var mockFn = function() {};
		jQuery.Deferred.getStackHook = mockFn;
		assert.strictEqual( jQuery.Deferred.getErrorHook, getErrorHook,
			"getStackHook does not mirror getErrorHook (setter)" );
	} );

	expectNoMessage( assert, "asyncHook from jQuery.Deferred.getStackHook reported", function() {
			jQuery.Deferred.getErrorHook = undefined;
			jQuery.Deferred.getStackHook = function() {

			// Throw an error as IE doesn't capture `stack` of non-thrown ones.
			try {
				throw new SyntaxError( "Different exception in jQuery.Deferred" );
			} catch ( err ) {
				return err;
			}
		};

		jQuery
			.when()
			.then( function() {
				throw new ReferenceError( "Test ReferenceError" );
			} )
			.catch( function() {
				var asyncError = exceptionHookSpy.lastCall.args[ 1 ];

				assert.strictEqual( asyncError, undefined,
					"Error not passed to exceptionHook" );

				done();
			} );
	} );
} );

QUnit.test( "jQuery.Deferred.getStackHook - disabled patch, getter + setter interaction",
		function( assert ) {
	assert.expect( 3 );

	jQuery.migrateDisablePatches( "deferred-getStackHook" );

	expectNoMessage( assert, "jQuery.Deferred.getStackHook - setter & getter", function() {
		var mockFn = function() {};
		assert.strictEqual( jQuery.Deferred.getStackHook, undefined,
			"getStackHook is `undefined` by default" );
		jQuery.Deferred.getStackHook = mockFn;
		assert.strictEqual( jQuery.Deferred.getStackHook, mockFn,
			"getStackHook getter reports what the setter set" );
	} );
} );

QUnit.test( ".pipe() warnings", function( assert ) {
	assert.expect( 4 );

	var d = jQuery.Deferred(),
		p = d.promise();

	function checkValue( v ) {
		assert.equal( v, 1, "got correct value" );
	}

	// Deferred
	expectMessage( assert, "pipe", function() {
		d.pipe( checkValue );
	} );

	// Deferred's promise object
	expectMessage( assert, "pipe", function() {
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

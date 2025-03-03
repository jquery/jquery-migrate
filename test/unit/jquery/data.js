QUnit.module( "data" );

function camelCase( string ) {
	return string.replace( /-([a-z])/g, function( _all, letter ) {
		return letter.toUpperCase();
	} );
}

[
	{
		apiName: "jQuery.data()",
		dataFn: function() {
			return jQuery.data.apply( jQuery, arguments );
		}
	},
	{
		apiName: "jQuery.fn.data()",
		dataFn: function( elem ) {
			var args = Array.prototype.slice.call( arguments, 1 );
			return jQuery.fn.data.apply( jQuery( elem ), args );
		}
	}
].forEach( function( params ) {
	var apiName = params.apiName;
	var dataFn = params.dataFn;

	QUnit.test( apiName + " camelCased names", function( assert ) {

		var sames = [
				"datum",
				"ropeAdope",
				"Олег\u0007Michał",
				"already-Big",
				"number-2",
				"unidash-"
			],
			diffs = [
				"dat-data",
				"hangy-dasher-",
				"-dashy-hanger"
			];

		assert.expect( 16 );

		var curData,
			div = document.createElement( "div" );

		// = .hasData + noWarning
		expectNoWarning( assert, "No existing data object", function() {
			sames.concat( diffs ).forEach( function( name ) {
				dataFn( div, name );
			} );
			assert.strictEqual( jQuery.hasData( div ), false,
				"data probes did not fill a data object" );
		} );

		// = sames.length + diffs.length + noWarning
		expectNoWarning( assert, "Data set/get without warning via API", function() {
			sames.concat( diffs ).forEach( function( name, index ) {
				dataFn( div, name, index );
				assert.strictEqual( dataFn( div, name ), index, name + "=" + index );
			} );
		} );

		// Camelized values set for all names above, get the data object
		curData = dataFn( div );

		// = diffs.length + warning
		expectWarning( assert, "Dashed name conflicts", diffs.length, function() {
			diffs.forEach( function( name, index ) {
				curData[ name ] = index;
				assert.strictEqual( dataFn( div, name ), curData[ name ],
					name + " respects data object" );
			} );
		} );

	} );

	QUnit.test( apiName + " camelCased names (mass setter)", function( assert ) {
		var sames = [
				"datum",
				"ropeAdope",
				"Олег\u0007Michał",
				"already-Big",
				"number-2",
				"unidash-"
			],
			diffs = [
				"dat-data",
				"hangy-dasher-",
				"-dashy-hanger"
			];

		assert.expect( 18 );

		var div = document.createElement( "div" );

		// = sames.length + noWarning
		expectNoWarning( assert, "Data set as an object and get without warning via API",
				function() {
			var testData = {};

			sames.forEach( function( name, index ) {
				testData[ name ] = index;
			} );

			dataFn( div, testData );

			sames.forEach( function( name, index ) {
				assert.strictEqual( dataFn( div, name ), index, name + "=" + index );
			} );
		} );

		// = diffs.length + warning
		expectWarning( assert, "Data set as an object and get without warning via API",
				function() {
			var testData = {};

			diffs.forEach( function( name, index ) {
				testData[ name ] = index;
			} );

			dataFn( div, testData );

			diffs.forEach( function( name, index ) {
				assert.strictEqual( dataFn( div, name ), index, name + "=" + index );
			} );
		} );

		// Make sure for non-camel keys both the provided & camelCased versions
		// have data saved under them.
		expectNoWarning( assert, "Data object contents", function() {
			var dataObj = dataFn( div );
			diffs.forEach( function( name, index ) {
				assert.strictEqual( dataObj[ name ], index, name + "=" + index );
				assert.strictEqual( dataObj[ camelCase( name ) ], index,
					camelCase( name ) + "=" + index );
			} );
		} );

	} );

} );

QUnit.test( ".removeData()", function( assert ) {
	assert.expect( 5 );

	var div1 = jQuery( "<div>" ).appendTo( "#qunit-fixture" ),
		div2 = jQuery( "<div>" ).appendTo( "#qunit-fixture" );

	// Mixed assignment
	div1.add( div2 )
		.data( { "a-a-a": 1, "b-bB": 2, "cCC": 3 } )
		.data( "d-d-d", 4 )
		.data( "e-eE", 5 )
		.data( "fFF", 6 );

	expectNoWarning( assert, "camelCase args", function() {
		div1
			.removeData( "aAA cCC eEE" )
			.removeData( [ "bBB", "dDD", "fFF" ] );
	} );

	expectWarning( assert, "Not camelCase args originally present", 2, function() {

		// We expect two warnings as only the object-set keys are set
		// in their original form.
		div2
			.removeData( "a-a-a e-eE" )
			.removeData( [ "d-d-d", "b-bB" ] );
	} );

	expectNoWarning( assert, "Not camelCase args originally missing", function() {
		div2
			.removeData( "c-cC" )
			.removeData( [ "f-f-f" ] );
	} );

	// Divergence from jQuery 3.x: partially camelCased keys set in the object
	// setter need to be passed in the same form when removing.
	div1.removeData( "b-bB" );

	assert.deepEqual( div1.data(), {}, "Data is empty. (div1)" );
	assert.deepEqual( div2.data(), {}, "Data is empty. (div2)" );
} );

QUnit.test( "properties from Object.prototype", function( assert ) {
	assert.expect( 6 );

	var div = jQuery( "<div>" ).appendTo( "#qunit-fixture" );

	div.data( "foo", "bar" );

	expectNoWarning( assert, "Regular properties", function() {
		assert.strictEqual( div.data( "foo" ), "bar", "data access" );
		assert.strictEqual( jQuery.data( div[ 0 ], "foo" ), "bar", "data access (static method)" );
	} );

	(
		Object.setPrototypeOf ? expectWarning : expectNoWarning
	)( assert, "Properties from Object.prototype", 2, function() {
		assert.ok( div.data().hasOwnProperty( "foo" ),
			"hasOwnProperty works" );
		assert.ok( jQuery.data( div[ 0 ] ).hasOwnProperty( "foo" ),
			"hasOwnProperty works (static method)" );
	} );
} );

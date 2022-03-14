QUnit.module( "data" );

QUnit.test( "jQuery.data() camelCased names", function( assert ) {

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
			jQuery.data( div, name );
		} );
		assert.equal( jQuery.hasData( div ), false, "data probes did not fill a data object" );
	} );

	// = sames.length + diffs.length + noWarning
	expectNoWarning( assert, "Data set/get without warning via API", function() {
		sames.concat( diffs ).forEach( function( name, index ) {
			jQuery.data( div, name, index );
			assert.equal( jQuery.data( div, name ), index, name + "=" + index );
		} );
	} );

	// Camelized values set for all names above, get the data object
	curData = jQuery.data( div );

	// = diffs.length + warning
	expectWarning( assert, "Dashed name conflicts", diffs.length, function() {
		diffs.forEach( function( name, index ) {
			curData[ name ] = index;
			assert.equal( jQuery.data( div, name ), curData[ name ],
				name + " respects data object" );
		} );
	} );

} );

QUnit.test( "jQuery.data() camelCased names (mass setter)", function( assert ) {
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

	assert.expect( 11 );

	var div = document.createElement( "div" );

	// = sames.length + noWarning
	expectNoWarning( assert, "Data set as an object and get without warning via API", function() {
		var testData = {};

		sames.forEach( function( name, index ) {
			testData[ name ] = index;
		} );

		jQuery.data( div, testData );

		sames.forEach( function( name, index ) {
			assert.equal( jQuery.data( div, name ), index, name + "=" + index );
		} );
	} );

	// = diffs.length + warning
	expectWarning( assert, "Data set as an object and get without warning via API", function() {
		var testData = {};

		diffs.forEach( function( name, index ) {
			testData[ name ] = index;
		} );

		jQuery.data( div, testData );

		diffs.forEach( function( name, index ) {
			assert.equal( jQuery.data( div, name ), index, name + "=" + index );
		} );
	} );

} );


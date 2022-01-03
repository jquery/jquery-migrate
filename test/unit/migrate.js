
QUnit.module( "migrate" );

QUnit.test( "jQuery.migrateVersion", function( assert ) {
	assert.expect( 1 );

	assert.ok( /^\d+\.\d+\.[\w\-]+/.test( jQuery.migrateVersion ), "Version property" );
} );

QUnit.test( "compareVersions and jQueryVersionSince", function( assert ) {
	assert.expect( 9 );

	assert.equal( compareVersions( "3.0.1", "3.0.0" ), 1, "greater than 1" );
	assert.equal( compareVersions( "3.0.1", "2.10.0" ), 1, "greater than 2" );
	assert.equal( compareVersions( "3.2.1", "3.3.0" ), -1, "less than 1" );
	assert.equal( compareVersions( "3.2.1", "4.1.3" ), -1, "less than 2" );
	assert.equal( compareVersions( "3.2.2", "3.11.1" ), -1, "less than 3" );
	assert.equal( compareVersions( "3.4.1", "3.4.1" ), 0, "equal" );


	// Test against live jQuery version with suitably generous comparisons
	assert.equal( jQueryVersionSince( "1.4.2" ), true, "since - past version" );
	assert.equal( jQueryVersionSince( "8.0.3" ), false, "since - future version" );
	assert.equal( jQueryVersionSince( jQuery.fn.jquery ), true, "since - equal" );
} );

QUnit.test( "jQuery.migrateDeduplicateWarnings", function( assert ) {
	assert.expect( 3 );

	var origValue = jQuery.migrateDeduplicateWarnings;
	assert.strictEqual( origValue, true, "true by default" );

	jQuery.migrateDeduplicateWarnings = true;
	expectWarning( assert, "jQuery.migrateDeduplicateWarnings === true", 1, function() {
		jQuery( "#" );
		jQuery( "#" );
	} );

	jQuery.migrateDeduplicateWarnings = false;
	expectWarning( assert, "jQuery.migrateDeduplicateWarnings === false", 2, function() {
		jQuery( "#" );
		jQuery( "#" );
	} );

	jQuery.migrateDeduplicateWarnings = origValue;
} );

QUnit.test( "disabling/enabling patches", function( assert ) {
	assert.expect( 14 );

	var elem = jQuery( "<div></div>" );

	elem.appendTo( "#qunit-fixture" );

	// We can't register new warnings in tests so we need to use
	// existing warnings. If the ones we rely on here get removed,
	// replace them with ones that still exist.

	assert.strictEqual( jQuery.migrateIsPatchEnabled( "size" ),
		true, "patch enabled by default (size)" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "parseJSON" ),
		true, "patch enabled by default (parseJSON)" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "toggleClass-bool" ),
		true, "patch enabled by default (toggleClass-bool)" );

	expectWarning( assert, "size (default)", function() {
		jQuery().size();
	} );
	expectWarning( assert, "parseJSON (default)", function() {
		jQuery.parseJSON( "{}" );
	} );
	expectWarning( assert, "toggleClass-bool (default)", function() {
		elem.toggleClass();
	} );

	jQuery.migrateDisablePatches( "size", "parseJSON" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "size" ),
		false, "patch disabled (size)" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "parseJSON" ),
		false, "patch disabled (parseJSON)" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "toggleClass-bool" ),
		true, "patch still enabled (toggleClass)" );

	expectNoWarning( assert, "size (disabled)", function() {
		jQuery().size();
	} );
	expectNoWarning( assert, "parseJSON (disabled)", function() {
		jQuery.parseJSON( "{}" );
	} );
	expectWarning( assert, "toggleClass-bool (still enabled)", function() {
		elem.toggleClass();
	} );

	jQuery.migrateDisablePatches( "toggleClass-bool" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "toggleClass-bool" ),
		false, "patch disabled (toggleClass)" );

	expectNoWarning( assert, "toggleClass-bool (disabled)", function() {
		elem.toggleClass();
	} );
} );

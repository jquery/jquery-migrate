
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
		jQuery.trim( " a " );
		jQuery.trim( "a" );
	} );

	jQuery.migrateDeduplicateWarnings = false;
	expectWarning( assert, "jQuery.migrateDeduplicateWarnings === false", 2, function() {
		jQuery.trim( " a " );
		jQuery.trim( "a" );
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

	assert.strictEqual( jQuery.migrateIsPatchEnabled( "pre-on-methods" ),
		true, "patch enabled by default (pre-on-methods)" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "proxy" ),
		true, "patch enabled by default (proxy)" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "shorthand-deprecated-v3" ),
		true, "patch enabled by default (shorthand-deprecated-v3)" );

	expectWarning( assert, "pre-on-methods (default)", function() {
		jQuery().bind();
	} );
	expectWarning( assert, "proxy (default)", function() {
		jQuery.proxy( jQuery.noop );
	} );
	expectWarning( assert, "shorthand-deprecated-v3 (default)", function() {
		jQuery().click();
	} );

	jQuery.migrateDisablePatches( "pre-on-methods", "proxy" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "pre-on-methods" ),
		false, "patch disabled (pre-on-methods)" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "proxy" ),
		false, "patch disabled (proxy)" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "shorthand-deprecated-v3" ),
		true, "patch still enabled (shorthand-deprecated-v3)" );

	expectNoWarning( assert, "pre-on-methods (default)", function() {
		jQuery().bind();
	} );
	expectNoWarning( assert, "proxy (default)", function() {
		jQuery.proxy( jQuery.noop );
	} );
	expectWarning( assert, "shorthand-deprecated-v3 (default)", function() {
		jQuery().click();
	} );

	jQuery.migrateDisablePatches( "shorthand-deprecated-v3" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "shorthand-deprecated-v3" ),
		false, "patch disabled (shorthand-deprecated-v3)" );

	expectNoWarning( assert, "shorthand-deprecated-v3 (disabled)", function() {
		jQuery().click();
	} );
} );

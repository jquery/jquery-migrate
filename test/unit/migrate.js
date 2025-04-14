
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

QUnit.test( "jQuery.migrateDeduplicateMessages", function( assert ) {
	assert.expect( 3 );

	var origValue = jQuery.migrateDeduplicateMessages;
	assert.strictEqual( origValue, true, "true by default" );

	jQuery.migrateDeduplicateMessages = true;
	expectMessage( assert, "jQuery.migrateDeduplicateMessages === true", 1, function() {
		jQuery.trim( " a " );
		jQuery.trim( "a" );
	} );

	jQuery.migrateDeduplicateMessages = false;
	expectMessage( assert, "jQuery.migrateDeduplicateMessages === false", 2, function() {
		jQuery.trim( " a " );
		jQuery.trim( "a" );
	} );

	jQuery.migrateDeduplicateMessages = origValue;
} );

QUnit.test( "disabling/enabling patches", function( assert ) {
	assert.expect( 32 );

	var elem = jQuery( "<div></div>" );

	elem.appendTo( "#qunit-fixture" );

	// We can't register new warnings in tests so we need to use
	// existing warnings. If the ones we rely on here get removed,
	// replace them with ones that still exist.

	// A few APIs that are not slated for removal to make these tests more stable:
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "pre-on-methods" ),
		true, "patch enabled by default (pre-on-methods)" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "proxy" ),
		true, "patch enabled by default (proxy)" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "shorthand-deprecated-v3" ),
		true, "patch enabled by default (shorthand-deprecated-v3)" );

	// APIs patched via `migratePatchAndWarnFunc` or `migratePatchAndInfoFunc`;
	// we're testing that:
	// * they don't warn on access but only when called
	// * they don't exist (access evaluates to `undefined`) if patch is disabled
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "push" ),
		true, "patch enabled by default (push)" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "isArray" ),
		true, "patch enabled by default (isArray)" );

	// APIs patched via `migrateWarnProp` or `migrateInfoProp`; we're testing that:
	// * they don't exist (access evaluates to `undefined`) if patch is disabled
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "event-global" ),
		true, "patch enabled by default (event-global)" );

	expectMessage( assert, "pre-on-methods (default)", function() {
		jQuery().bind();
	} );
	expectMessage( assert, "proxy (default)", function() {
		jQuery.proxy( jQuery.noop );
	} );
	expectMessage( assert, "shorthand-deprecated-v3 (default)", function() {
		jQuery().click();
	} );
	expectMessage( assert, "push (default)", function() {
		jQuery().push();
	} );
	expectMessage( assert, "isArray (default)", function() {
		jQuery.isArray();
	} );
	expectMessage( assert, "event-global (default)", function() {

		// eslint-disable-next-line no-unused-expressions
		jQuery.event.global;
	} );

	expectNoMessage( assert, "push access without calling (default)", function() {
		assert.strictEqual( typeof jQuery().push, "function",
			"access check doesn't trigger a message (push)" );
	} );
	expectNoMessage( assert, "isArray access without calling (default)", function() {
		assert.strictEqual( typeof jQuery.isArray, "function",
			"access check doesn't trigger a message (isArray)" );
	} );

	jQuery.migrateDisablePatches( "pre-on-methods", "proxy", "push", "isArray", "event-global" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "pre-on-methods" ),
		false, "patch disabled (pre-on-methods)" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "proxy" ),
		false, "patch disabled (proxy)" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "shorthand-deprecated-v3" ),
		true, "patch still enabled (shorthand-deprecated-v3)" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "push" ),
		false, "patch disabled (push)" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "event-global" ),
		false, "patch disabled (event-global)" );

	expectNoMessage( assert, "pre-on-methods (disabled)", function() {
		jQuery().bind();
	} );
	expectNoMessage( assert, "proxy (disabled)", function() {
		jQuery.proxy( jQuery.noop );
	} );
	expectMessage( assert, "shorthand-deprecated-v3 (not disabled)", function() {
		jQuery().click();
	} );
	expectNoMessage( assert, "push (disabled)", function() {
		assert.strictEqual( jQuery().push, undefined, "`jQuery.fn.push` no longer defined" );
	} );
	expectNoMessage( assert, "isArray (disabled)", function() {
		assert.strictEqual( jQuery.isArray, undefined, "`jQuery.isArray` no longer defined" );
	} );
	expectNoMessage( assert, "event-global (disabled)", function() {
		assert.strictEqual( jQuery.event.global, undefined,
			"`jQuery.event.global` no longer defined" );
	} );

	jQuery.migrateDisablePatches( "shorthand-deprecated-v3" );
	assert.strictEqual( jQuery.migrateIsPatchEnabled( "shorthand-deprecated-v3" ),
		false, "patch disabled (shorthand-deprecated-v3)" );

	expectNoMessage( assert, "shorthand-deprecated-v3 (disabled)", function() {
		jQuery().click();
	} );
} );

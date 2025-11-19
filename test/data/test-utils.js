"use strict";

/* exported expectMessage, expectNoMessage */

window.expectMessage = function expectMessage( assert, name, expected, fn ) {
	var result;
	if ( !fn ) {
		fn = expected;
		expected = null;
	}
	jQuery.migrateReset();
	result = fn();

	function check() {

		// Special-case for 0 messages expected
		if ( expected === 0 ) {
			assert.deepEqual( jQuery.migrateMessages, [], name + ": did not message" );

		// Simple numeric equality assertion for messages matching an explicit
		// count
		} else if ( expected && jQuery.migrateMessages.length === expected ) {
			assert.equal( jQuery.migrateMessages.length, expected, name + ": messaged" );

		// Simple ok assertion when we saw at least one message and weren't
		// looking for an explicit count
		} else if ( !expected && jQuery.migrateMessages.length ) {
			assert.ok( true, name + ": messaged" );

		// Failure; use deepEqual to show the messages that *were* generated
		// and the expectation
		} else {
			assert.deepEqual( jQuery.migrateMessages,
				"<messages: " + ( expected || "1+" ) + ">", name + ": messaged"
			);
		}
	}

	if ( result && result.then ) {
		return Promise.resolve(
			result.then( function() {
				check();
			} )
		);
	} else {
		check();
		return Promise.resolve();
	}
};

window.expectNoMessage = function expectNoMessage( assert, name, expected, fn ) {

	// Expected is present only for signature compatibility with expectMessage
	return expectMessage( assert, name, 0, fn || expected );
};

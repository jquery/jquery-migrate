QUnit.module( "attributes" );

( function() {
	function runTests( options ) {
		var patchEnabled = options.patchEnabled;

		function ifOn( warningsCount ) {
			return patchEnabled ? warningsCount : 0;
		}

		QUnit.test( ".attr( boolean attribute ) - patch " +
				( patchEnabled ? "enabled" : "disabled" ),
				function( assert ) {
			assert.expect( 33 );

			if ( !patchEnabled ) {
				jQuery.migrateDisablePatches( "boolean-attributes" );
			}

			expectNoMessage( assert, "setting value to null", function() {
				var $checkbox = jQuery( "<input type='checkbox' checked='checked' />" );

				$checkbox.attr( "checked", null );
				assert.equal(
					$checkbox.attr( "checked" ),
					undefined,
					"Remove checked by setting to null (verified by .attr)"
				);
			} );

			expectMessage( assert, "setting value to true", ifOn( 1 ), function() {
				var $checkbox = jQuery( "<input type='checkbox' />" );

				$checkbox.prop( "checked", true ).prop( "checked", false ).attr( "checked", true );
				assert.equal(
					$checkbox.attr( "checked" ),
					patchEnabled ? "checked" : "true",
					"Set checked (verified by .attr)"
				);
			} );

			expectMessage( assert, "value-less inline attributes", ifOn( 3 ), function() {
				var $checkbox = jQuery( "<input checked required autofocus type='checkbox'>" );

				jQuery.each( {
					checked: "Checked",
					required: "requiRed",
					autofocus: "AUTOFOCUS"
				}, function( lowercased, original ) {
					try {
						assert.strictEqual(
							$checkbox.attr( original ),
							patchEnabled ? lowercased : "",
							"The '" + this +
								"' attribute getter should return " +
								( patchEnabled ? "the lowercased name" : "an empty string" )
						);
					} catch ( _ ) {
						assert.ok( false, "The '" + this + "' attribute getter threw" );
					}
				} );
			} );

			expectMessage( assert, "checked: true", ifOn( 1 ), function() {
				var $checkbox = jQuery( "<input type='checkbox' />" );
				$checkbox
					.prop( "checked", true )
					.prop( "checked", false )
					.attr( "checked", true );
				assert.equal(
					$checkbox.attr( "checked" ),
					patchEnabled ? "checked" : "true",
					"Set checked (verified by .attr)"
				);
			} );
			expectNoMessage( assert, "checked: false", function() {
				var $checkbox = jQuery( "<input type='checkbox' />" );
				$checkbox
					.prop( "checked", false )
					.prop( "checked", true )
					.attr( "checked", false );
				assert.equal(
					$checkbox.attr( "checked" ),
					undefined,
					"Remove checked (verified by .attr)"
				);
			} );

			expectMessage( assert, "readonly: true", ifOn( 1 ), function() {
				var $input = jQuery( "<input />" );
				$input
					.prop( "readOnly", true )
					.prop( "readOnly", false )
					.attr( "readonly", true );
				assert.equal(
					$input.attr( "readonly" ),
					patchEnabled ? "readonly" : "true",
					"Set readonly (verified by .attr)"
				);
			} );
			expectNoMessage( assert, "readonly: false", function() {
				var $input = jQuery( "<input />" );
				$input
					.prop( "readOnly", false )
					.prop( "readOnly", true )
					.attr( "readonly", false );
				assert.equal(
					$input.attr( "readonly" ),
					undefined,
					"Remove readonly (verified by .attr)"
				);
			} );

			expectMessage( assert, "attribute/property interop", ifOn( 2 ), function() {
				var $checkbox = jQuery( "<input type='checkbox' />" );
				$checkbox
					.attr( "checked", true )
					.attr( "checked", false )
					.prop( "checked", true );
				assert.equal( $checkbox[ 0 ].checked, true,
					"Set checked property (verified by native property)" );
				assert.equal( $checkbox.prop( "checked" ), true,
					"Set checked property (verified by .prop)" );
				assert.equal(
					$checkbox.attr( "checked" ),
					undefined,
					"Setting checked property doesn't affect checked attribute"
				);
				$checkbox
					.attr( "checked", false )
					.attr( "checked", true )
					.prop( "checked", false );
				assert.equal( $checkbox[ 0 ].checked, false,
					"Clear checked property (verified by native property)" );
				assert.equal( $checkbox.prop( "checked" ), false,
					"Clear checked property (verified by .prop)" );
				assert.equal(
					$checkbox.attr( "checked" ),
					patchEnabled ? "checked" : "true",
					"Clearing checked property doesn't affect checked attribute"
				);
			} );

			expectMessage( assert, "HTML5 boolean attributes", ifOn( 2 ), function() {
				var $input = jQuery( "<input />" );
				$input.attr( {
					"autofocus": true,
					"required": true
				} );
				assert.equal(
					$input.attr( "autofocus" ),
					patchEnabled ? "autofocus" : "true",
					"Reading autofocus attribute yields 'autofocus'"
				);
				assert.equal(
					$input.attr( "autofocus", false ).attr( "autofocus" ),
					undefined,
					"Setting autofocus to false removes it"
				);
				assert.equal(
					$input.attr( "required" ),
					patchEnabled ? "required" : "true",
					"Reading required attribute yields 'required'"
				);
				assert.equal(
					$input.attr( "required", false ).attr( "required" ),
					undefined,
					"Setting required attribute to false removes it"
				);
			} );

			expectNoMessage( assert, "aria-* attributes", function() {
				var $input = jQuery( "<input />" );

				$input.attr( "aria-disabled", true );
				assert.equal(
					$input.attr( "aria-disabled" ),
					"true",
					"Setting aria attributes to true is not affected by boolean settings"
				);

				$input.attr( "aria-disabled", false );
				assert.equal(
					$input.attr( "aria-disabled" ),
					"false",
					"Setting aria attributes to false is not affected by boolean settings"
				);
			} );

			expectNoMessage( assert, "extra ex-boolean attrs values", function() {
				var $input = jQuery( "<input />" );

				$input.attr( "hidden", "until-found" );
				assert.equal(
					$input.attr( "hidden" ),
					"until-found",
					"Extra values of ex-boolean attributes are not changed"
				);
			} );
		} );
	}

	runTests( { patchEnabled: true } );
	runTests( { patchEnabled: false } );
} )();

QUnit.test( ".attr( data-* attribute )", function( assert ) {
	assert.expect( 6 );

	expectNoMessage( assert, "value: true", function() {
		var $input = jQuery( "<input />" );
		$input.attr( "data-something", true );
		assert.equal( $input.attr( "data-something" ), "true", "Set data attributes" );
		assert.equal( $input.data( "something" ), true,
			"Setting data attributes are not affected by boolean settings" );
	} );

	expectMessage( assert, "value: false", 1, function() {
		var $input = jQuery( "<input />" );
		$input.attr( "data-another", false );
		assert.equal( $input.attr( "data-another" ), "false", "Set data attributes" );
		assert.equal( $input.data( "another" ), false,
			"Setting data attributes are not affected by boolean settings" );
	} );
} );

QUnit.test( ".toggleClass( boolean )", function( assert ) {
	assert.expect( 14 );

	var e = jQuery( "<div />" ).appendTo( "#qunit-fixture" );

	expectMessage( assert, "toggling initially empty class", 1, function() {
		e.toggleClass( true );
		assert.equal( e[ 0 ].className, "", "Assert class is empty (data was empty)" );
	} );

	expectNoMessage( assert, ".toggleClass( string ) not full className", 1, function() {
		e.attr( "class", "" );
		e.toggleClass( "classy" );
		assert.equal( e.attr( "class" ), "classy", "class was toggle-set" );
		e.toggleClass( "classy", false );
		assert.equal( e.attr( "class" ), "", "class was toggle-removed" );
	} );

	expectMessage( assert, ".toggleClass() save and clear", 1, function() {
		e.addClass( "testD testE" );
		assert.ok( e.is( ".testD.testE" ), "Assert class present" );
		e.toggleClass();
		assert.ok( !e.is( ".testD.testE" ), "Assert class not present" );

		// N.B.: Store should have "testD testE" now, next test will assert that
	} );

	expectMessage( assert, ".toggleClass() restore", 1, function() {
		e.toggleClass();
		assert.ok( e.is( ".testD.testE" ), "Assert class present (restored from data)" );
	} );

	expectMessage( assert, ".toggleClass( boolean )", 5, function() {
		e.toggleClass( false );
		assert.ok( !e.is( ".testD.testE" ), "Assert class not present" );
		e.toggleClass( true );
		assert.ok( e.is( ".testD.testE" ), "Assert class present (restored from data)" );
		e.toggleClass();
		e.toggleClass( false );
		e.toggleClass();
		assert.ok( e.is( ".testD.testE" ), "Assert class present (restored from data)" );
	} );
} );

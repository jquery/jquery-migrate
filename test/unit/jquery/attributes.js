QUnit.module( "attributes" );

( function() {
	function runTests( options ) {
		var patchEnabled = options.patchEnabled;
		var stockJq4 = jQueryVersionSince( "4.0.0" ) && !patchEnabled;

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

			expectNoWarning( assert, "setting value to null", function() {
				var $checkbox = jQuery( "<input type='checkbox' checked='checked' />" );

				$checkbox.attr( "checked", null );
				assert.equal(
					$checkbox.attr( "checked" ),
					undefined,
					"Remove checked by setting to null (verified by .attr)"
				);
			} );

			expectWarning( assert, "setting value to true", ifOn( 1 ), function() {
				var $checkbox = jQuery( "<input type='checkbox' />" );

				$checkbox.prop( "checked", true ).prop( "checked", false ).attr( "checked", true );
				assert.equal(
					$checkbox.attr( "checked" ),
					stockJq4 ? "true" : "checked",
					"Set checked (verified by .attr)"
				);
			} );

			expectWarning( assert, "value-less inline attributes", ifOn( 3 ), function() {
				var $checkbox = jQuery( "<input checked required autofocus type='checkbox'>" );

				jQuery.each( {
					checked: "Checked",
					required: "requiRed",
					autofocus: "AUTOFOCUS"
				}, function( lowercased, original ) {
					try {
						assert.strictEqual(
							$checkbox.attr( original ),
							stockJq4 ? "" : lowercased,
							"The '" + this +
								"' attribute getter should return " +
								( stockJq4 ? "an empty string" : "the lowercased name" )
						);
					} catch ( _ ) {
						assert.ok( false, "The '" + this + "' attribute getter threw" );
					}
				} );
			} );

			expectWarning( assert, "checked: true", ifOn( 1 ), function() {
				var $checkbox = jQuery( "<input type='checkbox' />" );
				$checkbox
					.prop( "checked", true )
					.prop( "checked", false )
					.attr( "checked", true );
				assert.equal(
					$checkbox.attr( "checked" ),
					stockJq4 ? "true" : "checked",
					"Set checked (verified by .attr)"
				);
			} );
			expectNoWarning( assert, "checked: false", function() {
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

			expectWarning( assert, "readonly: true", ifOn( 1 ), function() {
				var $input = jQuery( "<input />" );
				$input
					.prop( "readOnly", true )
					.prop( "readOnly", false )
					.attr( "readonly", true );
				assert.equal(
					$input.attr( "readonly" ),
					stockJq4 ? "true" : "readonly",
					"Set readonly (verified by .attr)"
				);
			} );
			expectNoWarning( assert, "readonly: false", function() {
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

			expectWarning( assert, "attribute/property interop", ifOn( 2 ), function() {
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
					stockJq4 ? "true" : "checked",
					"Clearing checked property doesn't affect checked attribute"
				);
			} );

			expectWarning( assert, "HTML5 boolean attributes", ifOn( 2 ), function() {
				var $input = jQuery( "<input />" );
				$input.attr( {
					"autofocus": true,
					"required": true
				} );
				assert.equal(
					$input.attr( "autofocus" ),
					stockJq4 ? "true" : "autofocus",
					"Reading autofocus attribute yields 'autofocus'"
				);
				assert.equal(
					$input.attr( "autofocus", false ).attr( "autofocus" ),
					undefined,
					"Setting autofocus to false removes it"
				);
				assert.equal(
					$input.attr( "required" ),
					stockJq4 ? "true" : "required",
					"Reading required attribute yields 'required'"
				);
				assert.equal(
					$input.attr( "required", false ).attr( "required" ),
					undefined,
					"Setting required attribute to false removes it"
				);
			} );

			expectNoWarning( assert, "aria-* attributes", function() {
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

			expectNoWarning( assert, "extra ex-boolean attrs values", function() {
				var $input = jQuery( "<input />" );

				$input.attr( "hidden", "until-found" );

				if ( jQueryVersionSince( "4.0.0" ) ) {
					assert.equal(
						$input.attr( "hidden" ),
						"until-found",
						"Extra values of ex-boolean attributes are not changed"
					);
				} else {
					assert.ok( true,
						"Extra ex-boolean attrs values not supported under jQuery 3.x" );
				}
			} );
		} );
	}

	runTests( { patchEnabled: true } );
	runTests( { patchEnabled: false } );
} )();

QUnit.test( ".attr( data-* attribute )", function( assert ) {
	assert.expect( 6 );

	expectNoWarning( assert, "value: true", function() {
		var $input = jQuery( "<input />" );
		$input.attr( "data-something", true );
		assert.equal( $input.attr( "data-something" ), "true", "Set data attributes" );
		assert.equal( $input.data( "something" ), true,
			"Setting data attributes are not affected by boolean settings" );
	} );

	expectWarning( assert, "value: false", 1, function() {
		var $input = jQuery( "<input />" );
		$input.attr( "data-another", false );
		assert.equal( $input.attr( "data-another" ), "false", "Set data attributes" );
		assert.equal( $input.data( "another" ), false,
			"Setting data attributes are not affected by boolean settings" );
	} );
} );

QUnit.test( ".removeAttr( boolean attribute )", function( assert ) {
	assert.expect( 14 );

	expectNoWarning( assert, "non-boolean attr", function() {
		var $div = jQuery( "<div />" )
			.attr( "quack", "duck" )
			.removeAttr( "quack" );

		assert.equal( $div.attr( "quack" ), null, "non-boolean attribute was removed" );
		assert.equal( $div.prop( "quack" ), undefined, "property was not set" );
	} );

	expectWarning( assert, "boolean attr", function() {
		var $inp = jQuery( "<input type='checkbox' />" )
			.attr( "checked", "checked" )
			.prop( "checked", true )
			.removeAttr( "checked" );

		assert.equal( $inp.attr( "checked" ), null, "boolean attribute was removed" );
		assert.equal( $inp.prop( "checked" ), false, "property was changed" );
	} );

	// One warning per attribute name
	expectWarning( assert, "multiple boolean attr", 2, function() {
		jQuery( "<input type='checkbox' />" )
			.attr( "checked", "checked" )
			.attr( "readonly", "readonly" )
			.removeAttr( "checked readonly" );
	} );

	expectWarning( assert, "mixed attr, one boolean", function() {
		jQuery( "<input />" )
			.attr( "type", "text" )
			.attr( "size", "15" )
			.attr( "disabled", "disabled" )
			.removeAttr( "disabled" )
			.removeAttr( "size" );
	} );

	expectNoWarning( assert, "boolean attr when prop false", function() {
		var $inp = jQuery( "<input type='checkbox' />" )
			.attr( "checked", "checked" )
			.prop( "checked", false )
			.removeAttr( "checked" );

		assert.equal( $inp.attr( "checked" ), null, "boolean attribute was removed" );
		assert.equal( $inp.prop( "checked" ), false, "property was not changed" );
	} );

	expectWarning( assert, "boolean attr when only some props false", 1, function() {
		var $inp = jQuery(
				"<input type='checkbox' /><input type='checkbox' /><input type='checkbox' />"
			)
			.attr( "checked", "checked" )
			.prop( "checked", false )
			.eq( 1 ).prop( "checked", true ).end()
			.removeAttr( "checked" );

		assert.equal( $inp.attr( "checked" ), null, "boolean attribute was removed" );
		assert.equal( $inp.eq( 1 ).prop( "checked" ), false, "property was changed" );
	} );
} );

QUnit.test( ".toggleClass( boolean )", function( assert ) {
	assert.expect( 14 );

	var e = jQuery( "<div />" ).appendTo( "#qunit-fixture" );

	expectWarning( assert, "toggling initially empty class", 1, function() {
		e.toggleClass( true );
		assert.equal( e[ 0 ].className, "", "Assert class is empty (data was empty)" );
	} );

	expectNoWarning( assert, ".toggleClass( string ) not full className", 1, function() {
		e.attr( "class", "" );
		e.toggleClass( "classy" );
		assert.equal( e.attr( "class" ), "classy", "class was toggle-set" );
		e.toggleClass( "classy", false );
		assert.equal( e.attr( "class" ), "", "class was toggle-removed" );
	} );

	expectWarning( assert, ".toggleClass() save and clear", 1, function() {
		e.addClass( "testD testE" );
		assert.ok( e.is( ".testD.testE" ), "Assert class present" );
		e.toggleClass();
		assert.ok( !e.is( ".testD.testE" ), "Assert class not present" );

		// N.B.: Store should have "testD testE" now, next test will assert that
	} );

	expectWarning( assert, ".toggleClass() restore", 1, function() {
		e.toggleClass();
		assert.ok( e.is( ".testD.testE" ), "Assert class present (restored from data)" );
	} );

	expectWarning( assert, ".toggleClass( boolean )", 5, function() {
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

import { migratePatchFunc, migrateWarn } from "../main.js";
import { jQueryVersionSince } from "../compareVersions.js";

var oldRemoveAttr = jQuery.fn.removeAttr,
	oldJQueryAttr = jQuery.attr,
	oldToggleClass = jQuery.fn.toggleClass,
	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|" +
		"disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
	rbooleans = new RegExp( "^(?:" + booleans + ")$", "i" ),
	rmatchNonSpace = /\S+/g,

	// Some formerly boolean attributes gained new values with special meaning.
	// Skip the old boolean attr logic for those values.
	extraBoolAttrValues = {
		hidden: [ "until-found" ]
	};

// HTML boolean attributes have special behavior:
// we consider the lowercase name to be the only valid value, so
// getting (if the attribute is present) normalizes to that, as does
// setting to any non-`false` value (and setting to `false` removes the attribute).
// See https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes
jQuery.each( booleans.split( "|" ), function( _i, name ) {
	var origAttrHooks = jQuery.attrHooks[ name ] || {};
	jQuery.attrHooks[ name ] = {
		get: origAttrHooks.get || function( elem ) {
			var attrValue;

			if ( jQuery.migrateIsPatchEnabled( "boolean-attributes" ) ) {
				attrValue = elem.getAttribute( name );

				if ( attrValue !== name && attrValue != null &&
					( extraBoolAttrValues[ name ] || [] ).indexOf( attrValue ) === -1
				) {
					migrateWarn( "boolean-attributes",
						"Boolean attribute '" + name +
							"' value is different from its lowercased name" );

					// jQuery <4 attr hooks setup is complex: there are attr
					// hooks, bool hooks and selector attr handles. Only
					// implement the logic in jQuery >=4 where it's missing
					// and there are only attr hooks.
					if ( jQueryVersionSince( "4.0.0" ) ) {
						return name.toLowerCase();
					}
					return null;
				}
			}

			return null;
		},

		set: origAttrHooks.set || function( elem, value, name ) {
			if ( jQuery.migrateIsPatchEnabled( "boolean-attributes" ) ) {
				if ( value !== name &&
					( extraBoolAttrValues[ name ] || [] ).indexOf( value ) === -1
				) {
					if ( value !== false ) {
						migrateWarn( "boolean-attributes",
							"Boolean attribute '" + name +
								"' is not set to its lowercased name" );
					}

					if ( value === false ) {

						// Remove boolean attributes when set to false
						jQuery.removeAttr( elem, name );
					} else {
						elem.setAttribute( name, name );
					}
					return name;
				}
			} else if ( !jQueryVersionSince( "4.0.0" ) ) {

				// jQuery <4 uses a private `boolHook` for the boolean attribute
				// setter. It's only activated if `attrHook` is not set, but we set
				// it here in Migrate. Since we cannot access it, let's just repeat
				// its contents here.
				if ( value === false ) {

					// Remove boolean attributes when set to false
					jQuery.removeAttr( elem, name );
				} else {
					elem.setAttribute( name, name );
				}
				return name;
			}
		}
	};
} );

migratePatchFunc( jQuery, "attr", function( elem, name, value ) {
	var nType = elem.nodeType;

	// Fallback to the original method on text, comment and attribute nodes
	// and when attributes are not supported.
	if ( nType === 3 || nType === 8 || nType === 2 ||
			typeof elem.getAttribute === "undefined" ) {
		return oldJQueryAttr.apply( this, arguments );
	}

	if ( value === false && name.toLowerCase().indexOf( "aria-" ) !== 0 &&
			!rbooleans.test( name ) ) {
		migrateWarn( "attr-false",
			"Setting the non-ARIA non-boolean attribute '" + name +
				"' to false" );

		jQuery.attr( elem, name, "false" );
		return;
	}

	return oldJQueryAttr.apply( this, arguments );
}, "attr-false" );

migratePatchFunc( jQuery.fn, "removeAttr", function( name ) {
	var self = this,
		patchNeeded = false;

	jQuery.each( name.match( rmatchNonSpace ), function( _i, attr ) {
		if ( rbooleans.test( attr ) ) {

			// Only warn if at least a single node had the property set to
			// something else than `false`. Otherwise, this Migrate patch
			// doesn't influence the behavior and there's no need to set or warn.
			self.each( function() {
				if ( jQuery( this ).prop( attr ) !== false ) {
					patchNeeded = true;
					return false;
				}
			} );
		}

		if ( patchNeeded ) {
			migrateWarn( "removeAttr-bool",
				"jQuery.fn.removeAttr no longer sets boolean properties: " + attr );
			self.prop( attr, false );
		}
	} );

	return oldRemoveAttr.apply( this, arguments );
}, "removeAttr-bool" );

migratePatchFunc( jQuery.fn, "toggleClass", function( state ) {

	// Only deprecating no-args or single boolean arg
	if ( state !== undefined && typeof state !== "boolean" ) {

		return oldToggleClass.apply( this, arguments );
	}

	migrateWarn( "toggleClass-bool", "jQuery.fn.toggleClass( boolean ) is deprecated" );

	// Toggle entire class name of each element
	return this.each( function() {
		var className = this.getAttribute && this.getAttribute( "class" ) || "";

		if ( className ) {
			jQuery.data( this, "__className__", className );
		}

		// If the element has a class name or if we're passed `false`,
		// then remove the whole classname (if there was one, the above saved it).
		// Otherwise bring back whatever was previously saved (if anything),
		// falling back to the empty string if nothing was stored.
		if ( this.setAttribute ) {
			this.setAttribute( "class",
				className || state === false ?
					"" :
					jQuery.data( this, "__className__" ) || ""
			);
		}
	} );
}, "toggleClass-bool" );

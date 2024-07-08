import { migratePatchAndWarnFunc, migratePatchFunc, migrateWarn } from "../main.js";
import "../disablePatches.js";

var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,
	makeMarkup = function( html ) {
		var doc = window.document.implementation.createHTMLDocument( "" );
		doc.body.innerHTML = html;
		return doc.body && doc.body.innerHTML;
	},
	warnIfChanged = function( html ) {
		var changed = html.replace( rxhtmlTag, "<$1></$2>" );
		if ( changed !== html && makeMarkup( html ) !== makeMarkup( changed ) ) {
			migrateWarn( "self-closed-tags",
				"HTML tags must be properly nested and closed: " + html );
		}
	};

/**
 * Deprecated, please use `jQuery.migrateDisablePatches( "self-closed-tags" )` instead.
 * @deprecated
 */
migratePatchAndWarnFunc( jQuery, "UNSAFE_restoreLegacyHtmlPrefilter", function() {
	jQuery.migrateEnablePatches( "self-closed-tags" );
}, "legacy-self-closed-tags",
"jQuery.UNSAFE_restoreLegacyHtmlPrefilter deprecated; use " +
	"`jQuery.migrateEnablePatches( \"self-closed-tags\" )`" );

migratePatchFunc( jQuery, "htmlPrefilter", function( html ) {
	warnIfChanged( html );
	return html.replace( rxhtmlTag, "<$1></$2>" );
}, "self-closed-tags" );

// This patch needs to be disabled by default as it re-introduces
// security issues (CVE-2020-11022, CVE-2020-11023).
jQuery.migrateDisablePatches( "self-closed-tags" );

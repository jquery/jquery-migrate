import { migrateWarn } from "../main.js";

var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,
	origHtmlPrefilter = jQuery.htmlPrefilter,
	makeMarkup = function( html ) {
		var doc = window.document.implementation.createHTMLDocument( "" );
		doc.body.innerHTML = html;
		return doc.body && doc.body.innerHTML;
	},
	warnIfChanged = function( html ) {
		var changed = html.replace( rxhtmlTag, "<$1></$2>" );
		if ( changed !== html && makeMarkup( html ) !== makeMarkup( changed ) ) {
			migrateWarn( "HTML tags must be properly nested and closed: " + html );
		}
	};

jQuery.UNSAFE_restoreLegacyHtmlPrefilter = function() {
	jQuery.htmlPrefilter = function( html ) {
		warnIfChanged( html );
		return html.replace( rxhtmlTag, "<$1></$2>" );
	};
};

jQuery.htmlPrefilter = function( html ) {
	warnIfChanged( html );
	return origHtmlPrefilter( html );
};

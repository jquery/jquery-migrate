var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi;

jQuery.UNSAFE_restoreLegacyHtmlPrefilter = function() {
	jQuery.htmlPrefilter = function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	};
};

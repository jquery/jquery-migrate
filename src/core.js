
var matched, browser,
	oldAccess = jQuery.access,
	oldInit = jQuery.fn.init,
	// Note this does NOT include the # XSS fix from 1.7!
	rquickExpr = /^(?:.*(<[\w\W]+>)[^>]*|#([\w-]*))$/;

// $(html) "looks like html" rule change
jQuery.fn.init = function( selector, context, rootjQuery ) {
	var match;

	if ( selector && typeof selector === "string" && !jQuery.isPlainObject( context ) &&
			(match = rquickExpr.exec( selector )) && match[1] ) {
		// This is an HTML string according to the "old" rules; is it still?
		if ( selector.charAt( 0 ) !== "<" ) {
			migrateWarn("$(html) HTML strings must start with '<' character");
		}
		// Now process using loose rules; let pre-1.8 play too
		if ( context && context.context ) {
			// jQuery object as context; parseHTML expects a DOM object
			context = context.context;
		}
		if ( jQuery.parseHTML ) {
			return oldInit.call( this, jQuery.parseHTML( jQuery.trim(selector), context, true ),
					context, rootjQuery );
		}
	}
	return oldInit.apply( this, arguments );
};
jQuery.fn.init.prototype = jQuery.fn;

if ( jQuery.fn.jquery >= "1.9" ) {
	// jQuery.access( ..., pass )
	jQuery.access = function( elems, fn, key, value, chainable, emptyGet, pass ) {
		var i = 0,
			length = elems.length;

		if ( key && typeof key === "object" && value ) {
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], true, emptyGet, value );
			}
			return elems;
		} else if ( pass && key != null && value !== undefined ) {
			for ( ; i < length; i++ ) {
				fn( elems[i], key, value, true );
			}
			return elems;
		}
		return oldAccess.call( jQuery, elems, fn, key, value, chainable, emptyGet );
	};
}

jQuery.uaMatch = function( ua ) {
	ua = ua.toLowerCase();

	var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
		/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
		/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
		/(msie) ([\w.]+)/.exec( ua ) ||
		ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
		[];

	return {
		browser: match[ 1 ] || "",
		version: match[ 2 ] || "0"
	};
};

matched = jQuery.uaMatch( navigator.userAgent );
browser = {};

if ( matched.browser ) {
	browser[ matched.browser ] = true;
	browser.version = matched.version;
}

// Chrome is Webkit, but Webkit is also Safari.
if ( browser.chrome ) {
	browser.webkit = true;
} else if ( browser.webkit ) {
	browser.safari = true;
}

jQuery.browser = browser;

if ( JQMIGRATE_WARN ) {
	// Warn if the code tries to get jQuery.browser
	migrateWarnProp( jQuery, "browser", browser, "jQuery.browser is deprecated" );
}

jQuery.sub = function() {
	function jQuerySub( selector, context ) {
		return new jQuerySub.fn.init( selector, context );
	}
	jQuery.extend( true, jQuerySub, this );
	jQuerySub.superclass = this;
	jQuerySub.fn = jQuerySub.prototype = this();
	jQuerySub.fn.constructor = jQuerySub;
	jQuerySub.sub = this.sub;
	jQuerySub.fn.init = function init( selector, context ) {
		if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
			context = jQuerySub( context );
		}

		return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
	};
	jQuerySub.fn.init.prototype = jQuerySub.fn;
	var rootjQuerySub = jQuerySub(document);
	if ( JQMIGRATE_WARN ) {
		migrateWarn( "jQuery.sub() is deprecated" );
	}
	return jQuerySub;
};

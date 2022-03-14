import {
	migrateWarn,
	migratePatchAndWarnFunc,
	migratePatchFunc,
	migrateWarnProp
} from "../main.js";
import "../disablePatches.js";

var oldLoad = jQuery.fn.load,
	oldEventAdd = jQuery.event.add,
	originalFix = jQuery.event.fix;

jQuery.event.props = [];
jQuery.event.fixHooks = {};

migrateWarnProp( jQuery.event.props, "concat", jQuery.event.props.concat,
	"event-old-patch",
	"jQuery.event.props.concat() is deprecated and removed" );

migratePatchFunc( jQuery.event, "fix", function( originalEvent ) {
	var event,
		type = originalEvent.type,
		fixHook = this.fixHooks[ type ],
		props = jQuery.event.props;

	if ( props.length ) {
		migrateWarn( "event-old-patch",
			"jQuery.event.props are deprecated and removed: " + props.join() );
		while ( props.length ) {
			jQuery.event.addProp( props.pop() );
		}
	}

	if ( fixHook && !fixHook._migrated_ ) {
		fixHook._migrated_ = true;
		migrateWarn( "event-old-patch",
			"jQuery.event.fixHooks are deprecated and removed: " + type );
		if ( ( props = fixHook.props ) && props.length ) {
			while ( props.length ) {
				jQuery.event.addProp( props.pop() );
			}
		}
	}

	event = originalFix.call( this, originalEvent );

	return fixHook && fixHook.filter ?
		fixHook.filter( event, originalEvent ) :
		event;
}, "event-old-patch" );

migratePatchFunc( jQuery.event, "add", function( elem, types ) {

	// This misses the multiple-types case but that seems awfully rare
	if ( elem === window && types === "load" && window.document.readyState === "complete" ) {
		migrateWarn( "load-after-event",
			"jQuery(window).on('load'...) called after load event occurred" );
	}
	return oldEventAdd.apply( this, arguments );
}, "load-after-event" );

jQuery.each( [ "load", "unload", "error" ], function( _, name ) {

	migratePatchFunc( jQuery.fn, name, function() {
		var args = Array.prototype.slice.call( arguments, 0 );

		// If this is an ajax load() the first arg should be the string URL;
		// technically this could also be the "Anything" arg of the event .load()
		// which just goes to show why this dumb signature has been deprecated!
		// jQuery custom builds that exclude the Ajax module justifiably die here.
		if ( name === "load" && typeof args[ 0 ] === "string" ) {
			return oldLoad.apply( this, args );
		}

		migrateWarn( "shorthand-removed-v3",
			"jQuery.fn." + name + "() is deprecated" );

		args.splice( 0, 0, name );
		if ( arguments.length ) {
			return this.on.apply( this, args );
		}

		// Use .triggerHandler here because:
		// - load and unload events don't need to bubble, only applied to window or image
		// - error event should not bubble to window, although it does pre-1.7
		// See http://bugs.jquery.com/ticket/11820
		this.triggerHandler.apply( this, args );
		return this;
	}, "shorthand-removed-v3" );

} );

jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
	function( _i, name ) {

	// Handle event binding
	migratePatchAndWarnFunc( jQuery.fn, name, function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
		},
		"shorthand-deprecated-v3",
		"jQuery.fn." + name + "() event shorthand is deprecated" );
} );

// Trigger "ready" event only once, on document ready
jQuery( function() {
	jQuery( window.document ).triggerHandler( "ready" );
} );

jQuery.event.special.ready = {
	setup: function() {
		if ( this === window.document ) {
			migrateWarn( "ready-event", "'ready' event is deprecated" );
		}
	}
};

migratePatchAndWarnFunc( jQuery.fn, "bind", function( types, data, fn ) {
	return this.on( types, null, data, fn );
}, "pre-on-methods", "jQuery.fn.bind() is deprecated" );
migratePatchAndWarnFunc( jQuery.fn, "unbind", function( types, fn ) {
	return this.off( types, null, fn );
}, "pre-on-methods", "jQuery.fn.unbind() is deprecated" );
migratePatchAndWarnFunc( jQuery.fn, "delegate", function( selector, types, data, fn ) {
	return this.on( types, selector, data, fn );
}, "pre-on-methods", "jQuery.fn.delegate() is deprecated" );
migratePatchAndWarnFunc( jQuery.fn, "undelegate", function( selector, types, fn ) {
	return arguments.length === 1 ?
		this.off( selector, "**" ) :
		this.off( types, selector || "**", fn );
}, "pre-on-methods", "jQuery.fn.undelegate() is deprecated" );
migratePatchAndWarnFunc( jQuery.fn, "hover", function( fnOver, fnOut ) {
	return this.on( "mouseenter", fnOver ).on( "mouseleave", fnOut || fnOver );
}, "pre-on-methods", "jQuery.fn.hover() is deprecated" );

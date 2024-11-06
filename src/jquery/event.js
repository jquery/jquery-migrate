import {
	migrateWarn,
	migratePatchAndWarnFunc,
	migratePatchFunc
} from "../main.js";
import "../disablePatches.js";

var oldEventAdd = jQuery.event.add;

jQuery.event.props = [];
jQuery.event.fixHooks = {};

migratePatchFunc( jQuery.event, "add", function( elem, types ) {

	// This misses the multiple-types case but that seems awfully rare
	if ( elem === window && types === "load" && window.document.readyState === "complete" ) {
		migrateWarn( "load-after-event",
			"jQuery(window).on('load'...) called after load event occurred" );
	}
	return oldEventAdd.apply( this, arguments );
}, "load-after-event" );

jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
function( _i, name ) {

	// Handle event binding
	migratePatchAndWarnFunc( jQuery.fn, name, jQuery.fn[ name ], "shorthand-deprecated-v3",
		"jQuery.fn." + name + "() event shorthand is deprecated" );
} );

migratePatchAndWarnFunc( jQuery.fn, "bind", jQuery.fn.bind,
	"pre-on-methods", "jQuery.fn.bind() is deprecated" );
migratePatchAndWarnFunc( jQuery.fn, "unbind", jQuery.fn.unbind,
	"pre-on-methods", "jQuery.fn.unbind() is deprecated" );
migratePatchAndWarnFunc( jQuery.fn, "delegate", jQuery.fn.delegate,
	"pre-on-methods", "jQuery.fn.delegate() is deprecated" );
migratePatchAndWarnFunc( jQuery.fn, "undelegate", jQuery.fn.undelegate,
	"pre-on-methods", "jQuery.fn.undelegate() is deprecated" );

migratePatchAndWarnFunc( jQuery.fn, "hover", jQuery.fn.hover,
	"hover", "jQuery.fn.hover() is deprecated" );

/*!
 * jQuery Migrate - v@VERSION - @DATE
 * Copyright OpenJS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.com/license/
 */
import $ from "jquery";

// For ECMAScript module environments where a proper `window`
// is present, execute the factory and get jQuery.
function jQueryFactory( jQuery, window ) {

// @CODE
// build.js inserts compiled jQuery here

return jQuery;
}

var jQuery = jQueryFactory( $, window );

export { jQuery, jQuery as $ };

export default jQuery;

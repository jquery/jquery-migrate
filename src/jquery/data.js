import { migratePatchFunc } from "../main.js";
import { patchProto } from "../utils.js";

function patchDataProto( original, options ) {
	var warningId = options.warningId,
		apiName = options.apiName,
		isInstanceMethod = options.isInstanceMethod;

	return function apiWithProtoPatched() {
		var result = original.apply( this, arguments );

		if ( arguments.length !== ( isInstanceMethod ? 0 : 1 ) || result === undefined ) {
			return result;
		}

		patchProto( result, {
			warningId: warningId,
			apiName: apiName
		} );

		return result;
	};
}

migratePatchFunc( jQuery, "data",
	patchDataProto( jQuery.data, {
		warningId: "data-null-proto",
		apiName: "jQuery.data()",
		isInstanceMethod: false
	} ),
	"data-null-proto" );
migratePatchFunc( jQuery, "_data",
	patchDataProto( jQuery._data, {
		warningId: "data-null-proto",
		apiName: "jQuery._data()",
		isInstanceMethod: false
	} ),
	"data-null-proto" );
migratePatchFunc( jQuery.fn, "data",
	patchDataProto( jQuery.fn.data, {
		warningId: "data-null-proto",
		apiName: "jQuery.fn.data()",
		isInstanceMethod: true
	} ),
	"data-null-proto" );

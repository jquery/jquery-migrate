import { $ } from "jquery-migrate";

console.assert( /^jQuery/.test( $.expando ),
	"jQuery.expando should be detected on full jQuery" );
console.assert( typeof $.migrateVersion === "string" && $.migrateVersion.length > 0,
	"jQuery.migrateVersion was not detected, the jQuery Migrate bootstrap process has failed" );

import { $ as $imported } from "jquery-migrate";

import { $required } from "./jquery-migrate-require.cjs";

console.assert( $required === $imported,
	"Only one copy of full jQuery should exist" );
console.assert( /^jQuery/.test( $imported.expando ),
	"jQuery.expando should be detected on full jQuery" );
console.assert( typeof $imported.migrateVersion === "string" && $imported.migrateVersion.length > 0,
	"jQuery.migrateVersion was not detected, the jQuery Migrate bootstrap process has failed" );

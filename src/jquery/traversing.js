import { migratePatchAndWarnFunc } from "../main.js";

migratePatchAndWarnFunc( jQuery.fn, "andSelf", jQuery.fn.addBack, "andSelf",
	"jQuery.fn.andSelf() is deprecated and removed, use jQuery.fn.addBack()" );

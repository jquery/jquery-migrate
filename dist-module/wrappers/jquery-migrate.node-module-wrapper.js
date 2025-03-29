// Node.js is able to import from a CommonJS module in an ESM one.
import jQuery from "../../dist/jquery-migrate.js";

export { jQuery, jQuery as $ };
export default jQuery;

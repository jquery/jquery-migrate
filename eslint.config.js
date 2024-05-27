import jqueryConfig from "eslint-config-jquery";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

export default [
	{

		// Only global ignores will bypass the parser
		// and avoid JS parsing errors
		// See https://github.com/eslint/eslint/discussions/17412
		ignores: [ "external", "null.json", "simple.json" ]
	},

	{
		files: [ "eslint.config.js", "build/**" ],
		languageOptions: {
			ecmaVersion: "latest",
			globals: {
				...globals.node
			}
		},
		rules: jqueryConfig.rules
	},

	{
		files: [ "src/**" ],
		plugins: {
			import: importPlugin
		},
		languageOptions: {
			ecmaVersion: 2015,

			// The browser env is not enabled on purpose so that code takes
			// all browser-only globals from window instead of assuming
			// they're available as globals. This makes it possible to use
			// jQuery with tools like jsdom which provide a custom window
			// implementation.
			globals: {
				jQuery: false,
				window: false
			}
		},
		rules: {
			...jqueryConfig.rules,
			"import/extensions": [ "error", "always" ],
			"import/no-cycle": "error",
			indent: [
				"error",
				"tab",
				{
					outerIIFEBody: 0,

					// This makes it so code within if statements checking
					// for jQuery features is not indented.
					ignoredNodes: [ "Program > IfStatement > *" ]
				}
			],
			"one-var": [ "error", { var: "always" } ],
			strict: [ "error", "function" ]
		}
	},

	{
		files: [ "src/wrapper.js" ],
		languageOptions: {
			sourceType: "script",
			globals: {
				jQuery: false,
				define: false,
				module: false
			}
		},
		rules: {
			"no-unused-vars": "off",
			indent: [
				"error",
				"tab",
				{

					// This makes it so code within the wrapper is not indented.
					ignoredNodes: [
						"Program > ExpressionStatement > CallExpression > :last-child > *"
					]
				}
			]
		}
	},

	{
		files: [ "test/unit/**" ],
		languageOptions: {
			ecmaVersion: 2015,
			sourceType: "script",
			globals: {
				...globals.browser,
				jQuery: false,
				QUnit: false,
				url: false,
				expectWarning: false,
				expectNoWarning: false,
				compareVersions: false,
				jQueryVersionSince: false,
				startIframeTest: false,
				TestManager: false
			}
		},
		rules: {
			...jqueryConfig.rules,
			"no-unused-vars": [
				"error",
				{ args: "after-used", argsIgnorePattern: "^_" }
			]
		}
	},

	{
		files: [ "test/data/**" ],
		ignores: [ "test/data/jquery-*.js", "test/data/qunit-start.js" ],
		languageOptions: {
			ecmaVersion: 2015,
			sourceType: "script",
			globals: {
				...globals.browser,
				global: false,
				jQuery: false,
				QUnit: false,
				url: true,
				compareVersions: true,
				expectWarning: true,
				expectNoWarning: true,
				startIframeTest: true,
				TestManager: true
			}
		},
		rules: {
			...jqueryConfig.rules,
			strict: [ "error", "global" ]
		}
	},

	{
		files: [ "test/runner/**" ],
		languageOptions: {
			ecmaVersion: "latest",
			globals: {
				...globals.node
			},
			sourceType: "module"
		},
		rules: {
			...jqueryConfig.rules
		}
	},

	{
		files: [ "test/runner/listeners.js" ],
		languageOptions: {
			ecmaVersion: 5,
			globals: {
				...globals.browser,
				QUnit: false,
				Symbol: false
			},
			sourceType: "script"
		},
		rules: {
			...jqueryConfig.rules,
			strict: [ "error", "function" ]
		}
	},

	{
		files: [ "dist/jquery-migrate.js" ],
		languageOptions: {
			globals: {
				define: false,
				jQuery: false,
				module: false,
				Proxy: false,
				Reflect: false,
				window: false
			}
		},
		rules: {
			...jqueryConfig.rules,
			strict: [ "error", "function" ],

			// These are fine for the built version
			"no-multiple-empty-lines": "off",
			"one-var": "off"
		}
	},

	{
		files: [ "dist/**" ],
		languageOptions: {
			ecmaVersion: 5,
			sourceType: "script"
		}
	}
];

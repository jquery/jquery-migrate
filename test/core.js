

test( "jQuery.browser", function() {
	expect( 3 );
	var p, haveBool = false;

	ok( jQuery.browser, "jQuery.browser present" );
	ok( jQuery.browser.version, "have a browser version" );
	for ( p in jQuery.browser ) {
		if ( typeof jQuery.browser[ p ] === "boolean" ) {
			haveBool = true;
			break;
		}
	}
	ok( haveBool, "at least 1 Boolean property" );
});

test("jQuery.sub() - Static Methods", function(){
	expect( 18 );
	var Subclass = jQuery.sub();
	Subclass.extend({
		"topLevelMethod": function() {return this.debug;},
		"debug": false,
		"config": {
			"locale": "en_US"
		},
		"setup": function(config) {
			this.extend(true, this["config"], config);
		}
	});
	Subclass.fn.extend({"subClassMethod": function() { return this;}});

	//Test Simple Subclass
	ok(Subclass["topLevelMethod"]() === false, "Subclass.topLevelMethod thought debug was true");
	ok(Subclass["config"]["locale"] == "en_US", Subclass["config"]["locale"] + " is wrong!");
	deepEqual(Subclass["config"]["test"], undefined, "Subclass.config.test is set incorrectly");
	equal(jQuery.ajax, Subclass.ajax, "The subclass failed to get all top level methods");

	//Create a SubSubclass
	var SubSubclass = Subclass.sub();

	//Make Sure the SubSubclass inherited properly
	ok(SubSubclass["topLevelMethod"]() === false, "SubSubclass.topLevelMethod thought debug was true");
	ok(SubSubclass["config"]["locale"] == "en_US", SubSubclass["config"]["locale"] + " is wrong!");
	deepEqual(SubSubclass["config"]["test"], undefined, "SubSubclass.config.test is set incorrectly");
	equal(jQuery.ajax, SubSubclass.ajax, "The subsubclass failed to get all top level methods");

	//Modify The Subclass and test the Modifications
	SubSubclass.fn.extend({"subSubClassMethod": function() { return this;}});
	SubSubclass["setup"]({"locale": "es_MX", "test": "worked"});
	SubSubclass["debug"] = true;
	SubSubclass.ajax = function() {return false;};
	ok(SubSubclass["topLevelMethod"](), "SubSubclass.topLevelMethod thought debug was false");
	deepEqual(SubSubclass(document)["subClassMethod"], Subclass.fn["subClassMethod"], "Methods Differ!");
	ok(SubSubclass["config"]["locale"] == "es_MX", SubSubclass["config"]["locale"] + " is wrong!");
	ok(SubSubclass["config"]["test"] == "worked", "SubSubclass.config.test is set incorrectly");
	notEqual(jQuery.ajax, SubSubclass.ajax, "The subsubclass failed to get all top level methods");

	//This shows that the modifications to the SubSubClass did not bubble back up to it's superclass
	ok(Subclass["topLevelMethod"]() === false, "Subclass.topLevelMethod thought debug was true");
	ok(Subclass["config"]["locale"] == "en_US", Subclass["config"]["locale"] + " is wrong!");
	deepEqual(Subclass["config"]["test"], undefined, "Subclass.config.test is set incorrectly");
	deepEqual(Subclass(document)["subSubClassMethod"], undefined, "subSubClassMethod set incorrectly");
	equal(jQuery.ajax, Subclass.ajax, "The subclass failed to get all top level methods");
});

test("jQuery.sub() - .fn Methods", function(){
	expect( 378 );

	var Subclass = jQuery.sub(),
			SubclassSubclass = Subclass.sub(),
			jQueryDocument = jQuery(document),
			selectors, contexts, methods, method, arg, description;

	jQueryDocument.toString = function(){ return "jQueryDocument"; };

	Subclass.fn.subclassMethod = function(){};
	SubclassSubclass.fn.subclassSubclassMethod = function(){};

	selectors = [
		"body",
		"html, body",
		"<div></div>"
	];

	contexts = [undefined, document, jQueryDocument];

	jQuery.expandedEach = jQuery.each;
	jQuery.each(selectors, function(i, selector){

		jQuery.expandedEach({ // all methods that return a new jQuery instance
			"eq": 1 ,
			"add": document,
			"end": undefined,
			"has": undefined,
			"closest": "div",
			"filter": document,
			"find": "div"
		}, function(method, arg){
			jQuery.each(contexts, function(i, context){

				description = "(\""+selector+"\", "+context+")."+method+"("+(arg||"")+")";

				deepEqual(
					(function(var_args){ return jQuery.fn[method].apply(jQuery(selector, context), arguments).subclassMethod; })(arg),
					undefined, "jQuery"+description+" doesn't have Subclass methods"
				);
				deepEqual(
					(function(var_args){ return jQuery.fn[method].apply(jQuery(selector, context), arguments).subclassSubclassMethod; })(arg),
					undefined, "jQuery"+description+" doesn't have SubclassSubclass methods"
				);
				deepEqual(
					Subclass(selector, context)[method](arg).subclassMethod, Subclass.fn.subclassMethod,
					"Subclass"+description+" has Subclass methods"
				);
				deepEqual(
					Subclass(selector, context)[method](arg).subclassSubclassMethod, undefined,
					"Subclass"+description+" doesn't have SubclassSubclass methods"
				);
				deepEqual(
					SubclassSubclass(selector, context)[method](arg).subclassMethod, Subclass.fn.subclassMethod,
					"SubclassSubclass"+description+" has Subclass methods"
				);
				deepEqual(
					SubclassSubclass(selector, context)[method](arg).subclassSubclassMethod, SubclassSubclass.fn.subclassSubclassMethod,
					"SubclassSubclass"+description+" has SubclassSubclass methods"
				);

			});
		});
	});

});

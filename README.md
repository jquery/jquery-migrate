[![Build Status](https://travis-ci.org/jquery/jquery-migrate.svg?branch=master)](https://travis-ci.org/jquery/jquery-migrate)
[![Coverage Status](https://img.shields.io/coveralls/jquery/jquery-migrate.svg?style=flat)](https://coveralls.io/r/jquery/jquery-migrate?branch=master)

#### NOTE: To upgrade to jQurey 3.0 you first need version 1.12.x or 2.2.x. If you're using an older version, first upgrade to one of these versions using [jQuery Migrate 1.x](https://github.com/jquery/jquery-migrate/tree/1.x-stable#readme) to resolve any compatibility issues. Then you can upgrade to 3.0 using jQuery Migrate 3.0. For more information about the changes made in jQuery 3.0, see the [upgrade guide](http://jquery.com/upgrade-guide/3.0/) and [blog post](https://blog.jquery.com/2016/06/09/jquery-3-0-final-released/).

# jQuery Migrate
Upgrading jQuery can be painful, when breaking changes have been introduced.
jQuery Migrate helps you in this process, by restoring the APIs that were removed, and additionally shows warnings in the browser console (development version of jQuery migrate only) when removed and/or deprecated APIs are used.

That way you can spot and fix what otherwise would have been errors, until you no longer need jQuery migrate and can remove it.

## Usage

In your web page, load this plugin *after* the script tag for jQuery, for example:

```html
<script src="https://code.jquery.com/jquery-3.0.0.js"></script>
<script src="https://code.jquery.com/jquery-migrate-3.0.0.js"></script>
```

## Download

### Development vs. Production versions

The production build is minified and does not generate console warnings. It will only generate a console log message upon loading, or if it detects an error such as an outdated version of jQuery that it does not support. Do not use this file for development or debugging, it will make your life miserable. 

|  | Development | Production |
|--|-------------|------------|
| Debugging enabled | <p align="center">✓</p> |  |
| Minified |  | <p align="center">✓</p> |
| Latest release (*may be hotlinked if desired*) | [jquery-migrate-3.0.0.js](https://code.jquery.com/jquery-migrate-3.0.0.js) | [jquery-migrate-3.0.0.min.js](https://code.jquery.com/jquery-migrate-3.0.0.min.js) |
| \* Latest work-in-progress build | [jquery-migrate-git.js](https://code.jquery.com/jquery-migrate-git.js) | [jquery-migrate-git.min.js](https://code.jquery.com/jquery-migrate-git.min.js) |


\* **Work-in-progress build:** Although this file represents the most recent updates to the plugin, it may not have been thoroughly tested. We do not recommend using this file on production sites since it may be unstable; use the released production version instead.


## Debugging

The development version of the plugin displays warnings in the browser console. Older browsers such as IE9 doesn't support the console interface. No messages will be generated unless you include a debugging library such as [Firebug Lite](https://getfirebug.com/firebuglite) before including the jQuery Migrate plugin. Developers can also inspect the `jQuery.migrateWarnings` array to see what error messages have been generated.

All warnings generated by this plugin start with the string "JQMIGRATE". A list of the warnings you may see are in [warnings.md](https://github.com/jquery/jquery-migrate/blob/master/warnings.md).


## Migrate Plugin API

This plugin adds some properties to the `jQuery` object that can be used to programmatically control and examine its behavior:

`jQuery.migrateWarnings`: This property is an array of string warning messages that have been generated by the code on the page, in the order they were generated. Messages appear in the array only once, even if the condition has occurred multiple times, unless `jQuery.migrateReset()` is called.

`jQuery.migrateMute`: Set this property to `true` to prevent console warnings from being generated in the development version. The `jQuery.migrateWarnings` array is still maintained when this property is set, which allows programmatic inspection without console output.

`jQuery.migrateTrace`: Set this property to `false` if you want warnings but do not want stack traces to appear on the console.

`jQuery.migrateReset()`: This method clears the `jQuery.migrateWarnings` array and "forgets" the list of messages that have been seen already.

`jQuery.migrateVersion`: This string property indicates the version of Migrate in use.

## Reporting problems

Bugs that only occur when the jQuery Migrate plugin is used should be reported in the [jQuery Migrate Issue Tracker](https://github.com/jquery/jquery-migrate/issues) and should be accompanied by an executable test case that demonstrates the bug. The easiest way to do this is via an online test tool such as [jsFiddle.net](https://jsFiddle.net/) or [jsbin.com](https://jsbin.com). Use the development version when you are reporting bugs.

Bugs in jQuery itself should be reported on the [jQuery Core bug tracker](https://bugs.jquery.com/) and again should be accompanied by a test case from [jsFiddle.net](https://jsFiddle.net/) or [jsbin.com](http://jsbin.com) so that we can reproduce the issue.

For other questions about the plugin that aren't bugs, ask on the [jQuery Forum](http://forum.jquery.com).

Build and run tests:
====================================================

## Build with `npm` commands
```sh
$ git clone git://github.com/jquery/jquery-migrate.git
$ cd jquery-migrate
$ npm install
$ npm run build
```

## Build with [`grunt`](http://gruntjs.com/)

```sh
$ git clone git://github.com/jquery/jquery-migrate.git
$ cd jquery-migrate
$ npm install
$ npm install -g grunt-cli
$ grunt build
```

### Run tests

```sh
$ npm test
```

### Or

```sh
$ grunt test
```

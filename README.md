![CI Status](https://github.com/jquery/jquery-migrate/actions/workflows/node.js.yml/badge.svg?branch=main)

#### NOTE: To upgrade to jQuery 3.0, you first need version 1.12.x or 2.2.x. If you're using an older version, first upgrade to one of these versions using [jQuery Migrate 1.x](https://github.com/jquery/jquery-migrate/tree/1.x-stable#readme), to resolve any compatibility issues. For more information about the changes made in jQuery 3.0, see the [upgrade guide](https://jquery.com/upgrade-guide/3.0/) and [blog post](https://blog.jquery.com/2016/06/09/jquery-3-0-final-released/).

# jQuery Migrate
Upgrading libraries such as jQuery can be a lot of work, when breaking changes have been introduced. jQuery Migrate makes this easier, by restoring the APIs that were removed, and additionally shows warnings in the browser console (development version of jQuery Migrate only) when removed and/or deprecated APIs are used.

That way you can spot and fix what otherwise would have been errors, until you no longer need jQuery Migrate and can remove it.

## Version compatibility

The following table indicates which jQuery Migrate versions can be used with which jQuery versions:

| jQuery version | jQuery Migrate version  |
|----------------|-------------------------|
| 1.x            | 1.x                     |
| 2.x            | 1.x                     |
| 3.x            | 3.x / 4.x<sup>[1]</sup> |
| 4.x            | 3.x / 4.x<sup>[1]</sup> |

[1] NOTE: jQuery Migrate 4.x only supports the same browser as jQuery 4.x does. If you need to support Edge Legacy, Internet Explorer 9-10 or iOS 7+ (and not just 3 latest versions), use jQuery Migrate 3.x.

## Usage

In your web page, load this plugin *after* the script tag for jQuery, for example:

```html
<script src="https://code.jquery.com/jquery-3.6.0.js"></script>
<script src="https://code.jquery.com/jquery-migrate-3.4.0.js"></script>
```

## Download

### Development vs. Production versions

The production build is minified and does not generate console warnings. It will only generate a console log message upon loading, or if it detects an error such as an outdated version of jQuery that it does not support. Do not use this file for development or debugging, it will make your life miserable.

|  | Development | Production |
|--|-------------|------------|
| Debugging enabled | <p align="center">✓</p> |  |
| Minified |  | <p align="center">✓</p> |
| Latest release (*may be hotlinked if desired*) | [jquery-migrate-3.4.0.js](https://code.jquery.com/jquery-migrate-3.4.0.js) | [jquery-migrate-3.4.0.min.js](https://code.jquery.com/jquery-migrate-3.4.0.min.js) |
| \* Latest work-in-progress build | [jquery-migrate-git.js](https://releases.jquery.com/git/jquery-migrate-git.js) | [jquery-migrate-git.min.js](https://releases.jquery.com/git/jquery-migrate-git.min.js) |


\* **Work-in-progress build:** Although this file represents the most recent updates to the plugin, it may not have been thoroughly tested. We do not recommend using this file on production sites since it may be unstable; use the released production version instead.


## Debugging

The development version of the plugin displays warnings in the browser console. Older browsers such as IE9 doesn't support the console interface. No messages will be generated unless you include a debugging library such as [Firebug Lite](https://getfirebug.com/firebuglite) before including the jQuery Migrate plugin. Developers can also inspect the `jQuery.migrateWarnings` array to see what error messages have been generated.

All warnings generated by this plugin start with the string "JQMIGRATE". A list of the warnings you may see are in [warnings.md](https://github.com/jquery/jquery-migrate/blob/main/warnings.md).


## Migrate Plugin API

This plugin adds some properties to the `jQuery` object that can be used to programmatically control and examine its behavior:

`jQuery.migrateWarnings`: This property is an array of string warning messages that have been generated by the code on the page, in the order they were generated. Messages appear in the array only once, even if the condition has occurred multiple times, unless `jQuery.migrateReset()` is called.

`jQuery.migrateMute`: Set this property to `true` to prevent console warnings from being generated in the development version. The `jQuery.migrateWarnings` array is still maintained when this property is set, which allows programmatic inspection without console output.

`jQuery.migrateTrace`: Set this property to `false` if you want warnings but do not want stack traces to appear on the console.

`jQuery.migrateReset()`: This method clears the `jQuery.migrateWarnings` array and "forgets" the list of messages that have been seen already.

`jQuery.migrateVersion`: This string property indicates the version of Migrate in use.

`jQuery.migrateDeduplicateWarnings`: By default, Migrate only gives a specific warning once. If you set this property to `false` it will give a warning for every occurrence each time it happens. Note that this can generate a lot of output, for example when a warning occurs in a loop.

`jQuery.migrateDisablePatches`: Disables patches by their codes. You can find a code for each patch in square brackets in [warnings.md](https://github.com/jquery/jquery-migrate/blob/main/warnings.md). A limited number of warnings doesn't have codes defined and cannot be disabled. These are mostly setup issues like using an incorrect version of jQuery or loading Migrate multiple times.

`jQuery.migrateDisablePatches`: Disables patches by their codes.

`jQuery.migrateIsPatchEnabled`: Returns `true` if a patch of a provided code is enabled and `false` otherwise.

`jQuery.UNSAFE_restoreLegacyHtmlPrefilter`: A deprecated alias of `jQuery.migrateEnablePatches( "self-closed-tags" )`

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

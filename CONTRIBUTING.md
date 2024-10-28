# Contributing to jQuery Migrate

1. [Getting Involved](#getting-involved)
2. [Questions and Discussion](#questions-and-discussion)
3. [How To Report Bugs](#how-to-report-bugs)
4. [Tips for Bug Patching](#tips-for-bug-patching)


## Getting Involved

[API design principles](https://github.com/jquery/jquery/wiki/API-design-guidelines)

We're always looking for help [identifying bugs](#how-to-report-bugs), writing and reducing test cases, and improving documentation. And although new features are rare, anything passing our [guidelines](https://github.com/jquery/jquery/wiki/Adding-new-features) will be considered.

More information on how to contribute to this and other jQuery organization projects is at [contribute.jquery.org](https://contribute.jquery.org), including a short guide with tips, tricks, and ideas on [getting started with open source](https://contribute.jquery.org/open-source/). Please review our [commit & pull request guide](https://contribute.jquery.org/commits-and-pull-requests/) and [style guides](https://contribute.jquery.org/style-guide/) for instructions on how to maintain a fork and submit patches.

When opening a pull request, you'll be asked to sign our Contributor License Agreement. Both the Corporate and Individual agreements can be [previewed on GitHub](https://github.com/openjs-foundation/easycla).

If you're looking for some good issues to start with, [here are some issues labeled "help wanted" or "patch welcome"](https://github.com/jquery/jquery-migrate/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22%2C%22Patch+Welcome%22).

## Questions and Discussion

### Looking for help?

jQuery is so popular that many developers have knowledge of its capabilities and limitations. Most questions about using jQuery can be answered on popular forums such as [Stack Overflow](https://stackoverflow.com). Please start there when you have questions, even if you think you've found a bug.

The jQuery Core team watches [jQuery GitHub Discussions](https://github.com/jquery/jquery/discussions). If you have longer posts or questions that can't be answered in places such as Stack Overflow, please feel free to post them there. If you think you've found a bug, please [file it in the bug tracker](#how-to-report-bugs). The Core team can be found in the [#jquery/dev](https://matrix.to/#/#jquery_dev:gitter.im) Matrix channel on gitter.im.

### Weekly Status Meetings

The jQuery Core team has a weekly meeting to discuss the progress of current work. The meeting is held in the [#jquery/meeting](hhttps://matrix.to/#/#jquery_meeting:gitter.im) Matrix channel on gitter.im at [Noon EST](https://www.timeanddate.com/worldclock/fixedtime.html?month=10&day=7&year=2024&hour=12&min=0&sec=0&p1=43) on Mondays.

[jQuery Core Meeting Notes](https://meetings.jquery.org/category/core/)


## How to Report Bugs

### Make sure it is a jQuery Migrate bug

Most bugs reported to our bug tracker are actually bugs in user code, not in jQuery Migrate code. Keep in mind that just because your code throws an error inside of jQuery Migrate, this does *not* mean the bug is a jQuery Migrate bug.

Ask for help first on a discussion forum like [Stack Overflow](https://stackoverflow.com/). You will get much quicker support, and you will help avoid tying up the jQuery team with invalid bug reports.

### Disable browser extensions

Make sure you have reproduced the bug with all browser extensions and add-ons disabled, as these can sometimes cause things to break in interesting and unpredictable ways. Try using incognito, stealth or anonymous browsing modes.

### Try the latest version of jQuery Migrate

Bugs in old versions of jQuery Migrate may have already been fixed. In order to avoid reporting known issues, make sure you are always testing against the [latest build](https://releases.jquery.com/git/jquery-migrate-git.js). We cannot fix bugs in older released files, if a bug has been fixed in a subsequent version of jQuery Migrate the site should upgrade.

### Simplify the test case

When experiencing a problem, [reduce your code](https://webkit.org/test-case-reduction/) to the bare minimum required to reproduce the issue. This makes it *much* easier to isolate and fix the offending code. Bugs reported without reduced test cases take on average 9001% longer to fix than bugs that are submitted with them, so you really should try to do this if at all possible.

### Search for related or duplicate issues

Go to the [jQuery Migrate issue tracker](https://github.com/jquery/jquery-migrate/issues) and make sure the problem hasn't already been reported. If not, create a new issue there and include your test case.


## Tips For Bug Patching

We *love* when people contribute back to the project by patching the bugs they find. Since jQuery is used by so many people, we are cautious about the patches we accept and want to be sure they don't have a negative impact on the millions of people using jQuery each day. For that reason it can take a while for any suggested patch to work its way through the review and release process. The reward for you is knowing that the problem you fixed will improve things for millions of sites and billions of visits per day.

### Build a Local Copy of jQuery Migrate

Create a fork of the jQuery Migrate repo on GitHub at https://github.com/jquery/jquery-migrate

Clone your jQuery fork to work locally:

```bash
$ git clone git@github.com:username/jquery-migrate.git
```

Change directory to the newly created dir `jquery-migrate/`:

```bash
$ cd jquery-migrate
```

Add the jQuery Migrate `main` as a remote (e.g. `upstream`):

```bash
$ git remote add upstream git@github.com:jquery/jquery-migrate.git
```

Get in the habit of pulling in the "upstream" main to stay up to date as jQuery Migrate receives new commits:

```bash
$ git pull upstream main
```

Install the necessary dependencies:

```bash
$ npm install
```

Build all jQuery Migrate files:

```bash
$ npm run build
```

Start a test server:

```bash
$ npm run test:server
```

Now open the jQuery test suite in a browser at http://localhost:3000/test/.

Success! You just built and tested jQuery Migrate!

### Test Suite Tips...

During the process of writing your patch, you will run the test suite MANY times. You can speed up the process by narrowing the running test suite down to the module you are testing by either double-clicking the title of the test or appending it to the url. The following examples assume you're working on a local repo, hosted on your localhost server.

Example:

http://localhost:3000/test/?module=css

This will only run the "css" module tests. This will significantly speed up your development and debugging.

**ALWAYS RUN THE FULL SUITE BEFORE COMMITTING AND PUSHING A PATCH!**

#### Change the test server port

The default port for the test server is 3000. You can change the port by setting the `PORT` environment variable.

```bash
$ PORT=3001 npm run test:server
```

#### Loading changes on the test page

Rather than rebuilding jQuery Migrate with `npm run build` every time you make a change, you can use the included watch task to rebuild distribution files whenever a file is saved.

```bash
$ npm start
```

Alternatively, you can **load tests as ECMAScript modules** to avoid the need for rebuilding altogether.

Set the `jquery-migrate:` field to `esmodules` after loading the test page.

#### Running the test suite from the command line

You can also run the test suite from the command line.

First, prepare the tests:

```bash
$ npm run pretest
```

Make sure jQuery Migrate is built (`npm run build`) and run the tests:

```bash
$ npm run test:unit
```

This will run each module in its own browser instance and report the results in the terminal.

View the full help for the test suite for more info on running the tests from the command line:

```bash
$ npm run test:unit -- --help
```

### Repo organization

The jQuery Migrate source is organized with ECMAScript modules and then compiled into one file at build time.

### Browser support

Remember that jQuery Migrate supports multiple browsers and their versions; any contributed code must work in all of them. You can refer to the ["Version compatibility" section in Migrate README](https://github.com/jquery/jquery-migrate/blob/main/README.md#version-compatibility) for the current list of supported browsers.

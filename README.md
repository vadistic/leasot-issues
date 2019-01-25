# leasot-issues

> Parse and output github issues references from your code comments (leasot plugin)

Plugin for [leasot](https://github.com/pgilad/leasot)

## Installation

```sh
$ yarn install github.com/vadistic/leasot-issues
All set!
```

Package copies parser to leasot dir in node_modules during postinstall - so `leasot` needs to be installed first on the same level (global/local).

To fix it - reinstall this package or jsut copy parser file:

```sh
$ cp ./node_modules/dist/parsers/defaultIssues.js ./node_modules/leasot/dist/lib/parsers/
All fixed!
```

## Usage

Just specify issues parser while using `leasot`

```sh
$ leasot test/*.ts -A .ts,defaultIssues

test/index.test.ts
  line 1  TODO   Better example
  line 3  FIXME  Use leasot reporter
  line 4  ISSUE  https://github.com/notag/repo/issues/123
  line 5  ISSUE  https://github.com/withtag/repo/issues/123
```

## Todo

Main idea was to pull info from github using `@octokit/rest`, show issue data, and allowing filtering by closed/ open. The thing is that leasot parser is sync function with some higher level concurrent runner setup and making async call in parser seems impossible.

Maybe it would be possible via custom reporter?

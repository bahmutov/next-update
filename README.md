# next-update

Tests if module's dependencies can be updated to newer / latest versions
without breaking the tests.

## Install

    npm install -g next-update  // installs module globally
    next-update --help          // shows command line options

## Use

Make sure the target module has unit / integration tests,
and the tests can be run using `npm test` command.

Run `next-update` from the command line in the same folder as
the target module. In general this tool does the following:

1. Reads the module's dependencies (including dev) and their versions
2. Queries npm registry to see if there are newer versions
3. For each dependency that has newer versions available:
    1. Installs each version
    2. Runs command `npm test` to determine if the new version breaks the tests
    3. Installs back the current version.
4. Reports results

## Small print

Author: Gleb Bahmutov &copy; 2013

License: MIT - do anything with the code, but don't blame me if it does not work.
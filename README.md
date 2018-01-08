# Purdue Toolkit
[![Build Status](https://travis-ci.org/moufee/purdue-toolkit.svg?branch=develop)](https://travis-ci.org/moufee/purdue-toolkit)
[![dependencies Status](https://david-dm.org/moufee/purdue-toolkit/status.svg)](https://david-dm.org/moufee/purdue-toolkit)
[![devDependencies Status](https://david-dm.org/moufee/purdue-toolkit/dev-status.svg)](https://david-dm.org/moufee/purdue-toolkit?type=dev)

This is a NodeJS/Express app. Currently, its only function is to watch classes for available spaces and notify users when a space opens up in the class. Additional functions are planned for the future. It is hosted at [puclass.space](http://puclass.space)

## Installation

Ensure that node/npm and yarn are installed then run `yarn` (or `npm install`) in the project root. A config file will need to be placed in the root directory. It should be formatted according to the config.js schema file. If you want to deploy with pm2, you can customize the included pm2 config file.

## Development

Things that need to be done:
* write more tests
* expand the JSON API
    * allow account deletion
    * allow watch creation
* upgrade dependencies
* group watches by CRN for more efficient checking
* use promises where possible
* possibly consolidate error handlers
* move data processing code out of routes and models where appropriate


# Purdue Toolkit

This is a NodeJS/Express app. Currently, it's only function is to watch classes for available spaces and notify users when a space opens up in the class. Additional functions are planned for the future. It is hosted at [puclass.space](http://puclass.space)

## Installation

Ensure that node/npm and yarn are installed then run `yarn` (or `npm install`) in the project root. A "config.json" file will need to be placed in the root directory. It should be formatted like the "config-example" file. If you want to deploy with pm2, you can customize the included pm2 config file.

## Development

Things that need to be done:
* write tests
* expand the JSON API
    * allow account deletion
* upgrade bootstrap
* upgrade dependencies
* group watches by CRN for more efficient checking


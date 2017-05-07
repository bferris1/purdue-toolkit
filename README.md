# Purdue Toolkit
This is a NodeJS/Express app. Currently, it's only function is to watch classes for available spaces and notify users when a space opens up in the class. Additional functions are planned for the future. It is intermittently hosted at [puclass.space](http://puclass.space)

## Installation

Ensure that node/npm are installed then run `npm install` in the project root. A "config.json" file will need to be placed in the root directory. It should be in this form:

```json
{
  "db": {
    "userName": "myusername",
    "password": "dbpassword",
    "url": "mongodb://user:password@address/database"
  },

  "session": {
    "name": "Session Name",
    "secret": "yoursessionsecret"
  },

  "jwt": {
    "secret": "jwtsecret"
  },

  "sendgrid": {
    "key": "sendgrid key for sending email"
  },
  
  "pushover":{
    "key":"pushover application key"
   },
   
  "checker":{
    "interval": 5
  }
}
```

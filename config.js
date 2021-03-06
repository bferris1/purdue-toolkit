const convict = require('convict');
const fs = require('fs');

// Define a schema
const config = convict({
	env: {
		doc: 'The application environment.',
		format: ['production', 'development', 'test'],
		default: 'development',
		env: 'NODE_ENV'
	},
	port: {
		doc: 'The port to bind.',
		format: 'port',
		default: 3000,
		env: 'PORT'
	},

	checkInterval: {
		doc: 'Number of minutes to wait between checking watches.',
		format: 'int',
		default: 7,
		env: 'INTERVAL'
	},

	hosting: {
		domain: {
			doc: 'The domain at which the app is hosted.',
			format: '*',
			default: 'puclass.space',
			env: 'DOMAIN'
		},
		url: {
			doc: 'The full url at which the app is hosted.',
			format: 'url',
			default: 'https://puclass.space',
			env: 'URL'
		}
	},

	session: {
		name: {
			doc: 'The name for the session',
			default: 'Purdue Toolkit Session'
		},
		secret: {
			doc: 'The secret for the session',
			default: 'supersecretsecret',
			sensitive: true
		},
		maxAge: {
			doc: 'The maximum age of the session',
			format: 'int',
			default: 7
		}
	},

	jwt: {
		secret: {
			doc: 'The secret for JWTs',
			default: 'anothersupersecretstring',
			sensitive: true
		}
	},

	db: {
		url: {
			doc: 'Database url, including username and password',
			format: '*',
			default: 'mongodb://127.0.0.1/purdue-toolkit',
			env: 'DB_URL',
			sensitive: true
		}
	},

	pushover: {
		doc: 'The pushover app key',
		format: '*',
		default: '',
		env: 'PUSHOVER'
	},

	testing: {
		email: {
			doc: 'Email address to use when running tests',
			format: 'email',
			default: 'testing@puclass.space',
			env: 'TESTING_EMAIL'
		},
		pushoverKey: {
			doc: 'The pushover user key to use for testing',
			format: '*',
			default: '',
			env: 'TESTING_PUSHOVER'
		}
	},
	sendgrid: {
		key: {
			doc: 'The Sendgrid API key',
			default: '',
			env: 'SENDGRID_KEY'
		},
		fromName: {
			default: 'Class Watcher'
		}
	},
	auth: {
		google: {
			clientID: {default: ''},
			clientSecret: {default: ''}
		}
	}
});

// Load environment dependent configuration
const env = config.get('env');
if (fs.existsSync(`./config/${env}-config.json`))
	config.loadFile(`./config/${env}-config.json`);

// Perform validation
config.validate({allowed: 'strict'});

module.exports = config;
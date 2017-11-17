const convict = require('convict');

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

	checkInverval: {
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
			default: '',
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
			env: 'PUSHOVER_KEY'
		},
		fromName: {
			default: 'Class Watcher'
		}
	}
});

// Load environment dependent configuration
// const env = config.get('env');
config.loadFile('./convict-config.json');

// Perform validation
config.validate({allowed: 'strict'});

module.exports = config;
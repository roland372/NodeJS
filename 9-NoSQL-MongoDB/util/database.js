// connect to mongodb
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

// use client to connect to database
const mongoConnect = callback => {
	MongoClient.connect('mongodb+srv...')
		.then(client => {
			console.log('connected');
			// store a connection to databasse in _db variable
			_db = client.db();
			callback();
		})
		.catch(err => {
			console.log(err);
			throw err;
		});
};

const getDb = () => {
	// if we're connected
	if (_db) {
		// return access to that database if it exists
		return _db;
	}
	throw 'no database found';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

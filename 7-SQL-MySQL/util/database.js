// setup a code that allow us to connect to sql database
// import mysql
const mysql = require('mysql2');

// create pool of connections that allow us to always reach out to whenever we have query to run
const pool = mysql.createPool({
	// pass some info about our database engine/host that we're connecting to
	// define a hostname
	host: 'localhost',
	// username
	user: 'root',
	// database name, just like in mysql
	database: 'node_complete',
	// password assigned during installation of your database
	password: '123456',
});

// exporting with promise allows to use async promise chains
module.exports = pool.promise();

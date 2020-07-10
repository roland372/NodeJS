// import express
const express = require('express');
const bodyParser = require('body-parser');

// register routes
const feedRoutes = require('./routes/feed');

// create express app
const app = express();

// initialize body parser
// we used that before, but this time we're not dealing with forms
// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded - default data when submitted through a <form>

// we're using  json this time to parse json data from incoming requests
app.use(bodyParser.json()); // application/json

// set special headers on any responses that leaves our server
app.use((req, res, next) => {
	// to allow all urls/clients/domains to access our server, * will allow access to any client/domain, but you can also specify only specific url, like codepen, to separate multiple domains use ','
	res.setHeader('Access-Control-Allow-Origin', '*');
	// allow those origins to use specific http methods, specify that methods we allow
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, PATCH, DELETE'
	);
	// headers that clients may set on their requests
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	// call next so that request can continue and can be handled by our routes
	next();
});

// use routes to forward any incoming requests
// only forward requests that start with /feed, and for that use feedRoutes
app.use('/feed', feedRoutes);

// listen to upcoming requests
app.listen(8080);

// we can use postman, to test our rest api with incoming requests, and see responses

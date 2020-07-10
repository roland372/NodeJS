const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images');
	},
	filename: (req, file, cb) => {
		cb(
			null,
			new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname
		);
	},
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
	multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
// use for any request that goes to images folder
// static is used to serve files from specified directory
// with path point to/construct an absoulte path to the images folder
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Methods',
		'OPTIONS, GET, POST, PUT, PATCH, DELETE'
	);
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

// register error handling middleware
// this will be executed whenever error is thrown or is forwarded with next()
app.use((error, req, res, next) => {
	console.log(error);
	// extract status code from error object
	// || 500 will be default value in case statusCode is undefined
	const status = error.statusCode || 500;
	// extract message error (holds message that we passed when constructing new Error)

	const message = error.message;
	// retrieve any errors
	const data = error.data;
	// return response with status code that we extracted, and json data object with message attached into it
	res.status(status).json({ message: message, data: data });
});

// establish a connection to database
mongoose
	.connect('mongodb+srv...')
	// if we're connected, start the server and listen to requests
	.then(result => {
		app.listen(8080);
	})
	.catch(err => console.log(err));

// handle validation
// npm install --save express-validator

// connect to database
// npm install --save mongoose

// file uploading
// npm install --save multer

// hash password in secure way
// npm install --save bcryptjs

// generate web token
// npm install --save jsonwebtoken

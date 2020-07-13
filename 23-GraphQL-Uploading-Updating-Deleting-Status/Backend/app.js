const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { graphqlHTTP } = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth');
const { clearImage } = require('./util/file');

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
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Methods',
		'OPTIONS, GET, POST, PUT, PATCH, DELETE'
	);
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	if (req.method === 'OPTIONS') {
		return res.sendStatus(200);
	}
	next();
});

// this middleware will run on every request that reaches graphql, but will not deny the request if there's no token
app.use(auth);

// route to uploading images
// put method will replace an old image
app.put('/post-image', (req, res, next) => {
	// if user is noth authenticated
	if (!req.isAuth) {
		throw new Error('Not authenticated!');
	}
	// check if file does not exist
	if (!req.file) {
		return res.status(200).json({ message: 'No file provided.' });
	}
	// clear an existing image if there is one based on an old path to the image
	if (req.body.oldPath) {
		// delete old image at old path
		clearImage(req.body.oldPath);
	}
	return (
		res
			.status(201)
			// path where multer stored an new image
			.json({ message: 'File stored.', filePath: req.file.path })
	);
});

// use graphql
app.use(
	'/graphql',
	graphqlHTTP({
		schema: graphqlSchema,
		rootValue: graphqlResolver,
		// when we enter http://localhost:8080/graphql it will allow us to work with special UI to play around with our graphql api
		graphiql: true,
		// formatError(err) {
		// 	if (!err.originalError) {
		// 		return err;
		// 	}
		// 	const data = err.originalError.data;
		// 	const message = err.message || 'An error occurred.';
		// 	const code = err.originalError.code || 500;
		// 	return { message: message, status: code, data: data };
		// },
	})
);

app.use((error, req, res, next) => {
	console.log(error);
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;
	res.status(status).json({ message: message, data: data });
});

mongoose
	.connect('mongodb+srv...')
	.then(result => {
		app.listen(8080);
	})
	.catch(err => console.log(err));

// for defining schema of graphql
// npm install --save graphql

// for parsing incoming requests
// npm install --save express-graphql

// to validate user input
// npm install --save validator

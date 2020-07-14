const path = require('path');
const fs = require('fs');
const https = require('https');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const errorController = require('./controllers/error');
const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');
const User = require('./models/user');

const MONGODB_URI =
	// with process we can access enviromental variables, process is a part of nodejs
	// process.env.MONGO_USER - use variable
	`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.m3nby.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const app = express();
const store = new MongoDBStore({
	uri: MONGODB_URI,
	collection: 'sessions',
});
const csrfProtection = csrf();

// read server key
// reading file synchronously will block code execution until that file is read
// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

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

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// create a file that will store information about users logging in to our website/app
const accessLogStream = fs.createWriteStream(
	// specify path and file name
	path.join(__dirname, 'access.log'),
	// a - new data will be appended to the file, not overwriten
	{ flags: 'a' }
);

app.use(helmet());
app.use(compression());
app.use(
	morgan(
		// specify what data to log
		'combined',
		// stream logs to our file
		{ stream: accessLogStream }
	)
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
	multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
	session({
		secret: 'my secret',
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);

app.use(flash());

app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	next();
});

app.use((req, res, next) => {
	// throw new Error('Sync Dummy');
	if (!req.session.user) {
		return next();
	}
	User.findById(req.session.user._id)
		.then(user => {
			if (!user) {
				return next();
			}
			req.user = user;
			next();
		})
		.catch(err => {
			next(new Error(err));
		});
});

app.post('/create-order', isAuth, shopController.postOrder);

app.use(csrfProtection);
app.use((req, res, next) => {
	res.locals.csrfToken = req.csrfToken();
	next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
	// res.status(error.httpStatusCode).render(...);
	// res.redirect('/500');
	res.status(500).render('500', {
		pageTitle: 'Error!',
		path: '/500',
		isAuthenticated: req.session.isLoggedIn,
	});
});

mongoose
	.connect(MONGODB_URI)
	.then(result => {
		// set enviromental port, it will be automatically injected by host provider, if it's undefined use 3000 for local developement
		app.listen(process.env.PORT || 3000);

		// manually start server in https mode
		// https
		// 	.createServer(
		// 		{ key: privateKey, cert: certificate },
		// 		// app will point to our express application
		// 		app
		// 	)
		// 	.listen(process.env.PORT || 3000);
	})
	.catch(err => {
		console.log(err);
	});

// to run nodemon.json
// npm install win-node-env

// secure headers in node express applications
// npm install --save helmet

// serve optimized/compressed assets like css styles, images will not be compressed
// npm install --save compression

// makes loging request data into your console when user will login or page is reloaded more simple gives you info about time, browser etc. user used for logging
// npm install --save morgan

// setup SSL connection on our own server
// https://slproweb.com/products/Win32OpenSSL.html
// create certificate
// openssl req -nodes -new -x509 -keyout server.key -out server.cert

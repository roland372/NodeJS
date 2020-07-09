const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
// import multer
const multer = require('multer');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv...';

const app = express();
const store = new MongoDBStore({
	uri: MONGODB_URI,
	collection: 'sessions',
});
const csrfProtection = csrf();

// specify destination to save/read files
const fileStorage = multer.diskStorage({
	// where to store file
	destination: (req, file, cb) => {
		// callback that we have to call once we're done setting up destination
		// (error message, place where you want to store it)
		cb(null, 'images');
	},
	// how to name the file after it's been uploaded
	filename: (req, file, cb) => {
		cb(
			// (error message, file name that we want to use)
			// combine original filename with current date
			null,
			// new Date().toISOString().replace(/:/g, '-') + file.originalname
			new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname
		);
	},
});

// specify what file extensions we allow to upload
const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	) {
		// if file should be stored
		cb(null, true);
		// if we don't accept the file
	} else {
		cb(null, false);
	}
};

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
// initialize multer
app.use(
	// handle single file upload, (image), name should be the same as the name in the input
	// specify destination folder and file filter
	multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(express.static(path.join(__dirname, 'public')));
// point to images folder, to allow express to download/display them to a page
// if we have request, that starts with /images, then serve these files
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
	session({
		secret: 'my secret',
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.csrfToken = req.csrfToken();
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
		app.listen(3000);
	})
	.catch(err => {
		console.log(err);
	});

// handle file requests/uploads
// npm install --save multer

// generate pdf documents
// npm install --save pdfkit

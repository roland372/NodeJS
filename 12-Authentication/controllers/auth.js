const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

// initialize nodemailer
const transporter = nodemailer.createTransport(
	sendgridTransport({
		// configure transporter
		auth: {
			api_key:
				// sendgrid api key
				'SG.',
		},
	})
);

exports.getLogin = (req, res, next) => {
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render('auth/login', {
		path: '/login',
		pageTitle: 'Login',
		errorMessage: message,
	});
};

exports.getSignup = (req, res, next) => {
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render('auth/signup', {
		path: '/signup',
		pageTitle: 'Signup',
		errorMessage: message,
	});
};

exports.postLogin = (req, res, next) => {
	// extract email and password
	const email = req.body.email;
	const password = req.body.password;

	// identify user by email
	User.findOne({ email: email })
		.then(user => {
			// if we don't have a user in a database
			if (!user) {
				// flash an error message into our session
				// (key, message value)
				req.flash('error', 'Invalid email or password.');

				// redirect back to login
				return res.redirect('/login');
			}
			// validate password
			// bcrypt will compare hashed password and passowrd user enters in an input, based on it's algorythm
			bcrypt
				.compare(password, user.password)
				.then(doMatch => {
					// if passwords are equal
					if (doMatch) {
						// set a session
						req.session.isLoggedIn = true;
						req.session.user = user;
						return req.session.save(err => {
							console.log(err);
							// and redirect
							res.redirect('/');
						});
					}
					req.flash('error', 'Invalid email or password.');
					res.redirect('/login');
				})
				.catch(err => {
					console.log(err);
					// if we fail to compare passwords, redirect user back to login page
					res.redirect('/login');
				});
		})
		.catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
	// store a new user in a database
	const email = req.body.email;
	const password = req.body.password;
	const confirmPassword = req.body.confirmPassword;

	// make sure that each user has unique email
	// (email from a database, email that we're extracting)
	User.findOne({ email: email })
		.then(userDoc => {
			// if the user exists
			if (userDoc) {
				req.flash(
					'error',
					'E-Mail exists already, please pick a differend one.'
				);
				// we don't want to create a new one, just redirect
				return res.redirect('/signup');
			}
			// (value we want to hash/encrypt, level of encrypting(the higher the more secure, but it will take more time, 12 is pretty secure right now))
			return bcrypt
				.hash(password, 12)
				.then(hashedPassword => {
					// create a new user
					const user = new User({
						email: email,
						password: hashedPassword,
						// by default new user will have empty cart
						cart: { items: [] },
					});
					// save user to database
					return user.save();
				})
				.then(result => {
					// after user will sign up, we will rediredt to login
					res.redirect('/login');

					// send an email after signing up
					return transporter.sendMail({
						to: email,
						from: 'test@test.com',
						subject: 'Signup succeded!',
						html: '<h1>You succesfully signed up!</h1>',
					});
				})
				.catch(err => {
					console.log(err);
				});
		})
		.catch(err => {
			console.log(err);
		});
};

exports.postLogout = (req, res, next) => {
	req.session.destroy(err => {
		console.log(err);
		res.redirect('/');
	});
};

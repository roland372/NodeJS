// create secure random values
const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(
	sendgridTransport({
		auth: {
			api_key:
				// your sendgrid api key
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
	const email = req.body.email;
	const password = req.body.password;

	User.findOne({ email: email })
		.then(user => {
			if (!user) {
				req.flash('error', 'Invalid email or password.');
				return res.redirect('/login');
			}
			bcrypt
				.compare(password, user.password)
				.then(doMatch => {
					if (doMatch) {
						req.session.isLoggedIn = true;
						req.session.user = user;
						return req.session.save(err => {
							console.log(err);
							res.redirect('/');
						});
					}
					req.flash('error', 'Invalid email or password.');
					res.redirect('/login');
				})
				.catch(err => {
					console.log(err);
					res.redirect('/login');
				});
		})
		.catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	const confirmPassword = req.body.confirmPassword;
	User.findOne({ email: email })
		.then(userDoc => {
			if (userDoc) {
				req.flash(
					'error',
					'E-Mail exists already, please pick a differend one.'
				);
				return res.redirect('/signup');
			}
			return bcrypt
				.hash(password, 12)
				.then(hashedPassword => {
					const user = new User({
						email: email,
						password: hashedPassword,
						cart: { items: [] },
					});
					return user.save();
				})
				.then(result => {
					res.redirect('/login');
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

exports.getReset = (req, res, next) => {
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render('auth/reset', {
		path: '/reset',
		pageTitle: 'Reset Password',
		errorMessage: message,
	});
};

exports.postReset = (req, res, next) => {
	// generate random bytes
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			return res.redirect('/reset');
		}
		// convert buffer
		const token = buffer.toString('hex');
		// find user that we want to reset
		// match users email in database, and email that we want to reset (one that user will enter in input field)
		User.findOne({ email: req.body.email })
			.then(user => {
				// is user doesn't exist, emails don't match
				if (!user) {
					// display an error message
					req.flash('error', 'No account with that email found.');
					// and redirect back to reset
					return res.redirect('/reset');
				}
				// if user exists
				// set reset token
				user.resetToken = token;
				// set today's date + 1 hour
				user.resetTokenExpiration = Date.now() + 3600000;
				// update user in database
				return user.save();
			})
			.then(result => {
				// redirect to starting page
				res.redirect('/');
				// send an email
				transporter.sendMail({
					to: req.body.email,
					from: 'test@test.com',
					subject: 'Password reset',
					html: `
						<p>You requested a password reset</p>
						<p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
					`,
				});
			})
			.catch(err => {
				console.log(err);
			});
	});
};

exports.getNewPassword = (req, res, next) => {
	// check if reset tokens match
	const token = req.params.token;
	User.findOne({
		resetToken: token,
		// make sure that token didn't expired $gt - greater than
		resetTokenExpiration: { $gt: Date.now() },
	})
		// user that we want to reset password
		.then(user => {
			let message = req.flash('error');
			if (message.length > 0) {
				message = message[0];
			} else {
				message = null;
			}
			res.render('auth/new-password', {
				path: '/new-password',
				pageTitle: 'New Password',
				errorMessage: message,
				userId: user._id.toString(),
				passwordToken: token,
			});
		})
		.catch(err => {
			console.log(err);
		});
};

exports.postNewPassword = (req, res, next) => {
	// extract values
	const newPassword = req.body.password;
	const userId = req.body.userId;
	const passwordToken = req.body.passwordToken;
	let resetUser;

	// find user
	User.findOne({
		resetToken: passwordToken,
		resetTokenExpiration: { $gt: Date.now() },
		_id: userId,
	})
		.then(user => {
			resetUser = user;
			// generate new encrypted password
			return bcrypt.hash(newPassword, 12);
		})
		.then(hashedPassword => {
			// set new password
			resetUser.password = hashedPassword;
			// remove tokens
			resetUser.resetToken = undefined;
			resetTokenExpiration = undefined;
			// save user back to database with new password
			resetUser.save();
		})
		.then(result => {
			res.redirect('/login');
		})
		.catch(err => {
			console.log(err);
		});
};

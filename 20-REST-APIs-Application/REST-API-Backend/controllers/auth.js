const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
	// collect any validation errors
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed.');
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}
	// extract user properties
	const email = req.body.email;
	const name = req.body.name;
	const password = req.body.password;
	// hash password
	bcrypt
		.hash(password, 12)
		.then(hashedPw => {
			// create new user with hashed password
			const user = new User({
				email: email,
				password: hashedPw,
				name: name,
			});
			// save user to database
			return user.save();
		})
		// here we get result of saving user to database
		.then(result => {
			// set status and pass message
			res.status(201).json({ message: 'User created!', userId: result._id });
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.login = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	let loadedUser;
	// find out if email adress exists
	User.findOne({ email: email })
		.then(user => {
			// if user with that email doesn't exist
			if (!user) {
				const error = new Error('A user with this email could not be found.');
				error.statusCode = 401;
				throw error;
			}
			// email exists
			loadedUser = user;
			// compare user passwords
			return bcrypt.compare(password, user.password);
		})
		.then(isEqual => {
			// wrong password
			if (!isEqual) {
				const error = new Error('Wrong password!');
				error.statusCode = 401;
				throw error;
			}
			// password is correct
			// generate new json token
			// sign generates a new signature
			const token = jwt.sign(
				{
					email: loadedUser.email,
					userId: loadedUser._id.toString(),
				},
				// private key that is used to signing in, known only to the server
				'somesupersecretsecret',
				// expiration date, even if somehow token gets revealed, it will become unusable after expiration date
				{ expiresIn: '1h' }
			);
			// pass data to frontend
			res.status(200).json({ token: token, userId: loadedUser._id.toString() });
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

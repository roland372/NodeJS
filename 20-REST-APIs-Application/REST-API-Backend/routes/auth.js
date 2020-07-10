const express = require('express');
const { body } = require('express-validator/check');

const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

// user auth related route
router.put(
	'/signup',
	[
		// check email field/input
		body('email')
			.isEmail()
			.withMessage('Please enter a valid email.')
			.custom((value, { req }) => {
				// check if email already exists
				// if email at a database matches an email(value) that we pass in input field
				return User.findOne({ email: value }).then(userDoc => {
					if (userDoc) {
						// this will cause validation to fail
						return Promise.reject('E-Mail address already exists!');
					}
				});
			})
			// validate password
			.normalizeEmail(),
		body('password').trim().isLength({ min: 5 }),
		body('name').trim().not().isEmpty(),
	],
	authController.signup
);

router.post('/login', authController.login);

module.exports = router;

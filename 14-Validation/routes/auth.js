const express = require('express');
// import validator
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
	'/login',
	[
		body('email')
			.isEmail()
			.withMessage('Please enter a valid email address.')
			// eg. will normalize any uppercase letters
			.normalizeEmail(),
		body('password', 'Password has to be valid.')
			.isLength({ min: 5 })
			.isAlphanumeric()
			// eg. removes whitespace
			.trim(),
	],
	authController.postLogin
);

router.post(
	'/signup',
	[
		// email validation
		check('email')
			// if that's proper email format
			.isEmail()
			// in withMessage we can customize our message
			.withMessage('Please enter a valid email.')
			// custom error validator
			.custom((value, { req }) => {
				// if (value === 'test@test.com') {
				//   throw new Error('This email address if forbidden.');
				// }
				// return true;
				return User.findOne({ email: value }).then(userDoc => {
					if (userDoc) {
						return Promise.reject(
							'E-Mail exists already, please pick a different one.'
						);
					}
				});
			})
			.normalizeEmail(),
		// check password in body of the request
		body(
			'password',
			'Please enter a password with only numbers and text and at least 5 characters.'
		)
			.isLength({ min: 5 })
			.isAlphanumeric()
			.trim(),
		// compare password fields
		body('confirmPassword')
			.trim()
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error('Passwords have to match!');
				}
				// if passwords match return true
				return true;
			}),
	],
	authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;

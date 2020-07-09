const User = require('../models/user');
exports.getLogin = (req, res, next) => {
	res.render('auth/login', {
		path: '/login',
		pageTitle: 'Login',
		isAuthenticated: false,
	});
};

exports.postLogin = (req, res, next) => {
	User.findById('5f02e21ac851d7784b2dda76')
		.then(user => {
			req.session.isLoggedIn = true;
			req.session.user = user;
			req.session.save(err => {
				console.log(err);
				res.redirect('/');
			});
		})
		.catch(err => console.log(err));
};
// clear session cookies after we log out
exports.postLogout = (req, res, next) => {
	req.session.destroy(err => {
		console.log(err);
		res.redirect('/');
	});
};

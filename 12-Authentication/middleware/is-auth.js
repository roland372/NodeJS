// before we render a page, we want to makes sure that user is authenticated
module.exports = (req, res, next) => {
	// if user not logged in
	if (!req.session.isLoggedIn) {
		return res.redirect('/login');
	}
	// if logged in
	next();
};

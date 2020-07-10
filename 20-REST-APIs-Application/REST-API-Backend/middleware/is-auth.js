const jwt = require('jsonwebtoken');

// validate incoming tokens
module.exports = (req, res, next) => {
	// get Authorization header
	const authHeader = req.get('Authorization');
	// if we cant find a header
	if (!authHeader) {
		const error = new Error('Not authenticated.');
		error.statusCode = 401;
		throw error;
	}
	// extract token header value from incoming request
	// we get 'Beared token' back, using split we can get only token back
	const token = authHeader.split(' ')[1];
	let decodedToken;
	try {
		// decode and verify token
		decodedToken = jwt.verify(token, 'somesupersecretsecret');
		// if it fails
	} catch (err) {
		err.statusCode = 500;
		throw err;
	}
	// if token is undefined, not verified
	if (!decodedToken) {
		const error = new Error('Not authenticated.');
		error.statusCode = 401;
		throw error;
	}
	// if we have valid, decoded token
	req.userId = decodedToken.userId;
	// forward this request
	next();
};

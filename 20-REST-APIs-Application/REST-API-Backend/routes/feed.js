const express = require('express');
// import body validation
const { body } = require('express-validator/check');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// POST /feed/post
router.post(
	'/post',
	isAuth,
	[
		// validate incoming data
		body('title').trim().isLength({ min: 5 }),
		body('content').trim().isLength({ min: 5 }),
	],
	feedController.createPost
);

// route to get a single post, ':' is a dynamic parameter
router.get('/post/:postId', isAuth, feedController.getPost);

// route to edit posts
router.put(
	'/post/:postId',
	isAuth,
	[
		// validate incoming data
		body('title').trim().isLength({ min: 5 }),
		body('content').trim().isLength({ min: 5 }),
	],
	feedController.updatePost
);

router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;

// if no token is attached to the routes, we should block them

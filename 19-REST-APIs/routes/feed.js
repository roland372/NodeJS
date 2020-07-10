const express = require('express');

const feedController = require('../controllers/feed');

// create router by calling express
const router = express.Router();

// add routes - getPosts, function that will be executed for this route
// GET /feed/posts
router.get('/posts', feedController.getPosts);

// POST /feed/post
router.post('/post', feedController.createPost);

module.exports = router;

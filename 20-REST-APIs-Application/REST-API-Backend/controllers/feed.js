const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = (req, res, next) => {
	// extract current page number, if it's undefined, set default value as 1
	const currentPage = req.query.page || 1;
	// how many posts should be displayed per page
	const perPage = 2;
	// how many items we have in database
	let totalItems;
	// fetch post data from a database
	// find all posts
	Post.find()
		.countDocuments()
		.then(count => {
			totalItems = count;
			// add pagination
			return (
				Post.find()
					.skip((currentPage - 1) * perPage)
					// limit how many items we retrieve
					.limit(perPage)
			);
		})
		// if we get the posts
		.then(posts => {
			// send a response
			res.status(200).json({
				message: 'Fetched posts successfully.',
				// posts from a database
				posts: posts,
				totalItems: totalItems,
			});
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.createPost = (req, res, next) => {
	// use validation on request errors
	const errors = validationResult(req);
	// if we have errors
	if (!errors.isEmpty()) {
		// construct new error passing message we want to display
		const error = new Error('Validation failed, entered data is incorrect.');
		// throwing an error will try reaching next error handling middleware
		error.statusCode = 422;
		throw error;
	}
	if (!req.file) {
		const error = new Error('No image provided.');
		error.statusCode = 422;
		throw error;
	}
	const imageUrl = req.file.path;
	const title = req.body.title;
	const content = req.body.content;
	let creator;

	// create a new post based on a constructor schema
	const post = new Post({
		title: title,
		content: content,
		imageUrl: imageUrl,
		// set creator to user id, this will create a new post assigned to that user
		creator: req.userId,
	});
	// save post model to database
	post
		.save()
		.then(result => {
			// add post to the list of posts for logged user
			return User.findById(req.userId);
		})
		// now that we have user that is currently logged in
		.then(user => {
			creator = user;
			// access posts of the user and push newly created post object to that logged in user
			user.posts.push(post);
			// save user to database with his posts
			return user.save();
		})
		.then(result => {
			// send a response
			res.status(201).json({
				message: 'Post created successfully!',
				// pass created post
				post: post,
				// information about a creator
				creator: { _id: creator._id, name: creator.name },
			});
		})
		.catch(err => {
			// check if our error does not have status code
			if (!err.statusCode) {
				// if it doesn't exist, then add it
				err.statusCode = 500;
			}
			// passing an error will reach next error handling middleware
			next(err);
		});
};

exports.getPost = (req, res, next) => {
	// extract postId from incoming request (in feed.js route)
	const postId = req.params.postId;
	// find a post with that id in a database
	Post.findById(postId)
		.then(post => {
			// check if post is not undefined, if it is, then we know that post was not found
			if (!post) {
				const error = new Error('Could not find post.');
				error.statusCode = 404;
				// if we throw an error here it will be passed to next catch block and will be executed with status code and message that we specify here
				throw error;
			}
			// if we find a post in a database
			// return a 200 response
			res.status(200).json({
				// and a json data containing a message and an actual post
				message: 'Post fetched.',
				post: post,
			});
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.updatePost = (req, res, next) => {
	// get postId from params (params are part of your url)
	const postId = req.params.postId;
	// use validation on request errors
	const errors = validationResult(req);
	// if we have errors
	if (!errors.isEmpty()) {
		// construct new error passing message we want to display
		const error = new Error('Validation failed, entered data is incorrect.');
		// set status code
		error.statusCode = 422;
		// throwing an error will try reaching next error handling middleware
		throw error;
	}
	// extract from req.body
	const title = req.body.title;
	const content = req.body.content;

	// if no new file was uploaded/added then our frontend has all the logic to just take the existing url, and use that file
	let imageUrl = req.body.image;

	// but if we picked a file
	if (req.file) {
		// then replace that file at specified path
		imageUrl = req.file.path;
	}
	// if we didn't manage to extract a file from database and no file was uploaded, throw an error
	if (!imageUrl) {
		const error = new Error('No file picked.');
		error.statusCode = 422;
		throw error;
	}

	// if we make it past if statements, now we know that we have all valid data, and now we can update it in a database
	// find a post by it's id
	Post.findById(postId)
		// if we have no database error
		.then(post => {
			// check if post is undefined, if it does not exist
			if (!post) {
				// throw an error
				const error = new Error('Could not find post.');
				error.statusCode = 404;
				throw error;
			}
			// check if creator id is equal to id of the currently logged in user, only authorized users should be able to edit their posts
			if (post.creator.toString() !== req.userId) {
				const error = new Error('Not authorized');
				error.statusCode = 403;
				throw error;
			}

			// right before we save our post to database
			// check if our imageUrl which is a path to our image in images folder is not equal to the image that we stored in a post before
			// if new file that we're uploading is not equal to an old file that is currently in database/images folder
			if (imageUrl !== post.imageUrl) {
				// execute function to delete an image, and pass old image path as an argument
				clearImage(post.imageUrl);
			}
			// if we found a post, then we  want to update it in a database
			// set post properties
			post.title = title;
			post.imageUrl = imageUrl;
			post.content = content;
			// save updated post back to a database overwriting the old post, but keeping the old id
			return post.save();
		})
		// after updating database
		.then(result => {
			// set status code, and json code with a message
			res.status(200).json({
				message: 'Post updated!',
				// and return updated post
				post: result,
			});
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.deletePost = (req, res, next) => {
	// extract post id
	const postId = req.params.postId;
	// find a post by id
	Post.findById(postId)
		.then(post => {
			// if post doesn't exist
			if (!post) {
				const error = new Error('Could not find post.');
				error.statusCode = 404;
				throw error;
			}

			// check if creator id is equal to id of the currently logged in user, only authorized users should be able to delete their posts
			if (post.creator.toString() !== req.userId) {
				const error = new Error('Not authorized');
				error.statusCode = 403;
				throw error;
			}

			// remove image
			clearImage(post.imageUrl);
			// delete post
			return Post.findByIdAndRemove(postId);
		})
		.then(result => {
			// find user after we deleted the post
			return User.findById(req.userId);
		})
		.then(user => {
			// clear relation between user and the post in database
			// pass id of the post we want to remove from database
			user.posts.pull(postId);
			// save udpated user back to database
			return user.save();
		})
		.then(result => {
			res.status(200).json({ message: 'Deleted post.' });
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

// delete an image, we want to trigger this function whenever we're uploading a new image
const clearImage = filePath => {
	// construct a file path to an images folder
	// .. go up one folder, because we're running this inside a controllers folder, and we want to get access to images folder
	// filePath in our case will be images/image-name
	filePath = path.join(__dirname, '..', filePath);
	// then remove old image from images folder specified at filePath
	fs.unlink(filePath, err => console.log(err));
};

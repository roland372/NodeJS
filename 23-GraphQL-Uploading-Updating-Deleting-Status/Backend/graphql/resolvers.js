const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');
const { clearImage } = require('../util/file');
// logic that is executed for incoming queries
// module.exports = {
// 	//  you need every method/function for every query we defined in schema
// 	hello() {
// 		return {
// 			text: 'Hello World',
// 			views: 12345,
// 		};
// 	},
// };

// logic that is executed for incoming queries
// module.exports = {
// 	createUser(args, req) {
//     // on the incoming args object we can retrieve all data that we defined in our schema (email, name and password)
//     // const email = args.userInput.email;
// 	},
// };

// logic that is executed for incoming queries
// with destructuring args

module.exports = {
	createUser: async function ({ userInput }, req) {
		//   const email = args.userInput.email;
		// array to store errors
		const errors = [];
		// add validation
		// if email is not valid
		if (!validator.isEmail(userInput.email)) {
			errors.push({ message: 'E-Mail is invalid.' });
		}
		// password
		if (
			// if password is empty
			validator.isEmpty(userInput.password) ||
			// or too short
			!validator.isLength(userInput.password, { min: 5 })
		) {
			errors.push({ message: 'Password too short!' });
		}
		// if we have any errors in our array
		if (errors.length > 0) {
			const error = new Error('Invalid input.');
			error.data = errors;
			error.code = 422;
			throw error;
		}
		// on the incoming args object we can retrieve all data that we defined in our schema (email, name and password)
		// const email = userInput.email;
		// check if user already exists
		// check if email in database matches email in input field
		const existingUser = await User.findOne({ email: userInput.email });
		// if user exists
		if (existingUser) {
			// we don't want to create a new one
			const error = new Error('User exists already!');
			throw error;
		}
		// if user does not exist
		// hash the password
		// we use await here, because it might take a couple of seconds, we wait for it to finish before moving on
		const hashedPw = await bcrypt.hash(userInput.password, 12);
		// create new user object
		const user = new User({
			// pass properties
			email: userInput.email,
			name: userInput.name,
			password: hashedPw,
		});
		// save user to database
		const createdUser = await user.save();
		// grab just user data without any metadata that mongoose is attaching into it
		return {
			...createdUser._doc,
			_id:
				// overwrite existing id because we need to convert it form an object into a string
				createdUser._id.toString(),
		};
	},
	// login resolver
	login: async function ({ email, password }) {
		// find user with right email address and confirm password
		const user = await User.findOne({ email: email });
		if (!user) {
			const error = new Error('User not found.');
			error.code = 401;
			throw error;
		}
		const isEqual = await bcrypt.compare(password, user.password);
		if (!isEqual) {
			const error = new Error('Password is incorrect.');
			error.code = 401;
			throw error;
		}
		// generate json web token
		const token = jwt.sign(
			// pass information
			{
				userId: user._id.toString(),
				email: user.email,
			},
			'somesupersecretsecret',
			{ expiresIn: '1h' }
		);
		return { token: token, userId: user._id.toString() };
	},
	// create post resolver
	createPost: async function ({ postInput }, req) {
		if (!req.isAuth) {
			const error = new Error('Not authenticated!');
			error.code = 401;
			throw error;
		}
		// code below will not execute if user is not auth

		const errors = [];
		if (
			// check if input is empty
			validator.isEmpty(postInput.title) ||
			// too short
			!validator.isLength(postInput.title, { min: 5 })
		) {
			errors.push({ message: 'Title is invalid.' });
		}
		if (
			// check if input is empty
			validator.isEmpty(postInput.content) ||
			// too short
			!validator.isLength(postInput.content, { min: 5 })
		) {
			errors.push({ message: 'Content is invalid.' });
		}
		if (errors.length > 0) {
			const error = new Error('Invalid input.');
			error.data = errors;
			error.code = 422;
			throw error;
		}
		// grab user from database
		const user = await User.findById(req.userId);
		// if no user found
		if (!user) {
			const error = new Error('Invalid user.');
			error.code = 401;
			throw error;
		}
		// input is valid, create new post
		const post = new Post({
			title: postInput.title,
			content: postInput.content,
			imageUrl: postInput.imageUrl,
			creator: user,
		});
		// save post back to database
		const createdPost = await post.save();
		// push created post into user posts array, to set up a connection between them
		user.posts.push(createdPost);
		// save user post to database
		await user.save();
		return {
			...createdPost._doc,
			_id: createdPost._id.toString(),
			// overwrite when post was  created and updated
			createdAt: createdPost.createdAt.toISOString(),
			updatedAt: createdPost.updatedAt.toISOString(),
		};
	},
	posts: async function ({ page }, req) {
		// if user is not authenticated
		if (!req.isAuth) {
			const error = new Error('Not authenticated!');
			error.code = 401;
			throw error;
		}
		// implement pagination
		// if page is not set, is undefined
		if (!page) {
			// set default equal to 1, so we start at page 1
			page = 1;
		}
		// how many posts per page to display
		const perPage = 2;
		// find total number of posts and all posts
		const totalPosts = await Post.find().countDocuments();
		const posts = await Post.find()
			// sort in descending order
			.sort({ createdAt: -1 })
			.skip((page - 1) * perPage)
			.limit(perPage)
			// fetch all user data
			.populate('creator');
		return {
			posts: posts.map(p => {
				return {
					// extract all properties of posts
					...p._doc,
					// overwrite id, creation and updating date
					_id: p._id.toString(),
					createdAt: p.createdAt.toISOString(),
					updatedAt: p.updatedAt.toISOString(),
				};
			}),
			totalPosts: totalPosts,
		};
	},
	// fetch single post
	post: async function ({ id }, req) {
		if (!req.isAuth) {
			const error = new Error('Not authenticated!');
			error.code = 401;
			throw error;
		}
		const post = await Post.findById(id).populate('creator');
		if (!post) {
			const error = new Error('No post found!');
			error.code = 404;
			throw error;
		}
		return {
			...post._doc,
			_id: post._id.toString(),
			createdAt: post.createdAt.toISOString(),
			updatedAt: post.updatedAt.toISOString(),
		};
	},
	updatePost: async function ({ id, postInput }, req) {
		if (!req.isAuth) {
			const error = new Error('Not authenticated!');
			error.code = 401;
			throw error;
		}
		const post = await Post.findById(id).populate('creator');
		if (!post) {
			const error = new Error('No post found!');
			error.code = 404;
			throw error;
		}
		if (post.creator._id.toString() !== req.userId.toString()) {
			const error = new Error('Not authorized!');
			error.code = 403;
			throw error;
		}
		const errors = [];
		if (
			validator.isEmpty(postInput.title) ||
			!validator.isLength(postInput.title, { min: 5 })
		) {
			errors.push({ message: 'Title is invalid.' });
		}
		if (
			validator.isEmpty(postInput.content) ||
			!validator.isLength(postInput.content, { min: 5 })
		) {
			errors.push({ message: 'Content is invalid.' });
		}
		if (errors.length > 0) {
			const error = new Error('Invalid input.');
			error.data = errors;
			error.code = 422;
			throw error;
		}
		post.title = postInput.title;
		post.content = postInput.content;
		if (postInput.imageUrl !== 'undefined') {
			post.imageUrl = postInput.imageUrl;
		}
		const updatedPost = await post.save();
		return {
			...updatedPost._doc,
			_id: updatedPost._id.toString(),
			createdAt: updatedPost.createdAt.toISOString(),
			updatedAt: updatedPost.updatedAt.toISOString(),
		};
	},
	deletePost: async function ({ id }, req) {
		if (!req.isAuth) {
			const error = new Error('Not authenticated!');
			error.code = 401;
			throw error;
		}
		const post = await Post.findById(id);
		if (!post) {
			const error = new Error('No post found!');
			error.code = 404;
			throw error;
		}
		if (post.creator.toString() !== req.userId.toString()) {
			const error = new Error('Not authorized!');
			error.code = 403;
			throw error;
		}
		// delete post form folder
		clearImage(post.imageUrl);
		await Post.findByIdAndRemove(id);
		// get user
		const user = await User.findById(req.userId);
		// pull id of the post that we just deleted
		user.posts.pull(id);
		// save updated user back to database
		await user.save();
		return true;
	},
	user: async function (args, req) {
		if (!req.isAuth) {
			const error = new Error('Not authenticated!');
			error.code = 401;
			throw error;
		}
		const user = await User.findById(req.userId);
		if (!user) {
			const error = new Error('No user found!');
			error.code = 404;
			throw error;
		}
		return { ...user._doc, _id: user._id.toString() };
	},
	// user status resolver
	updateStatus: async function ({ status }, req) {
		if (!req.isAuth) {
			const error = new Error('Not authenticated!');
			error.code = 401;
			throw error;
		}
		const user = await User.findById(req.userId);
		if (!user) {
			const error = new Error('No user found!');
			error.code = 404;
			throw error;
		}
		user.status = status;
		await user.save();
		return { ...user._doc, _id: user._id.toString() };
	},
};

// define how a post should look like
const mongoose = require('mongoose');
// extract schema package
const Schema = mongoose.Schema;

// define how post should look like in a database and in your app
const postSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		imageUrl: {
			type: String,
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		creator: {
			// relation between posts and users
			// we store creator of every post in post we create
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	// additional option
	// mongoose will automatically add timestamp whenever new post is created/ new object is added to database
	{ timestamps: true }
);

// export model based on a schema
// (name, schema to use)
module.exports = mongoose.model('Post', postSchema);

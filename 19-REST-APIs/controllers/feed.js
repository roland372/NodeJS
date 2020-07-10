exports.getPosts = (req, res, next) => {
	// we won't be calling a render simply because we'll not render views, instead we'll be returning data

	// return response with json data
	res.status(200).json({
		posts: [{ title: 'First Post', content: 'This is the first post!' }],
	});
};

// client has to render user interface based on our response

exports.createPost = (req, res, next) => {
	const title = req.body.title;
	const content = req.body.content;

	// create post in db
	// send a json response
	// 201 - success, a resource was created
	res.status(201).json({
		message: 'Post created successfully!',
		post: { id: new Date().toISOString(), title: title, content: content },
	});
};

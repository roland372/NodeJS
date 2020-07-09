const path = require('path');
// import express
const express = require('express');
// import body-parser
const bodyParser = require('body-parser');

const app = express();

// import routes
const adminRoutes = require('./routes/admin');
const showRoutes = require('./routes/shop');

// // function that we will pass in use() will be executed on every incoming request
// app.use((req, res, next) => {
// 	console.log('in the middleware');
// 	// we have to call next() here to allow request to continue the next middleware
// 	next();
// });

// parse incoming request body that we send through a form
app.use(bodyParser.urlencoded({ extended: false }));

// normally from the browser user will have no access to any files or folder that we have in our project such as views, routes, etc, but that also means we are unable to load any css files
// with static we can allow an access to a public folder, where we can put css or any other files, that we don't worry if there are avalaible to anyone publicly
// static(path to a folder that we want to grant access to)
app.use(express.static(path.join(__dirname, 'public')));

// only routes starting with /admin will go to admin route
app.use('/admin', adminRoutes);
app.use(showRoutes);

// display error with status 404 when we enter page that does not exist
app.use((req, res, next) => {
	// res.status(404).send('<h1>page not found</h1>');
	res.status(404).sendFile(path.join(__dirname, 'views', 'not-found.html'));
});

// run app variable that contains a express function on our createServer
// const server = http.createServer(app);
// server.listen(3000);

// shorter way of running and creating a server
app.listen(3000);

// npm install --save express (--save install as a production dependency)
// npm install --save body-parser

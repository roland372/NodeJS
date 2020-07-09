// create a server with nodejs

// ./ will look for a local file, ommiting it will always look for a global module
// const http = require('./http');

// two ways to import modules
// const http = require('http');
// import http from 'http';

// metod 1
// (request, and response)
// function rqListener(req, res) {}
// create server requires a request, we can pass a function that will execute on every incoming request
// http.createServer(rqListener);

// method 2 we can pass annonymous (without a name) function
// http.createServer(function (req, res) {});

// method 3 with arrow function
// http.createServer((req, res) => {});

// we can store our createserver method in a variable, so that we'll be actually able to do something with it
// const server = http.createServer((req, res) => {
// 	// console.log(req.url, req.method, req.headers);
// 	// this command will exit our event loop stopping the server
// 	// process.exit();

// 	// handle response
// 	// (type of header, value)
// 	// tell browser, that we're writing html code
// 	res.setHeader('Content-Type', 'text/html');
// 	// write some data to response
// 	res.write('<html>');
// 	res.write('<head><title>My first page</title></head>');
// 	res.write('<body><h1>hello from nodejs server</h1></body>');
// 	res.write('</html>');
// 	// tell node that we're done with creating a response
// 	res.end();
// });

// nodejs will listen to every incoming request to our server and not immediately exit node app.js command
// listen(port, host name)
// server.listen(3000);
// and now we can type localhost:3000 in our browser, to access our server, even though server is running, we don't recieve any html page or response because our server is not yet configured

// after we handle a reponse, we should be able to see an actual html page

//
//
//

const http = require('http');
// allows us to work with files system
const fs = require('fs');

const server = http.createServer((req, res) => {
	// allow user to enter some data, which we can store in a file on the server once it is sent
	const url = req.url;
	const method = req.method;
	// check if url is equal to /
	if (url === '/') {
		res.write('<html>');
		res.write('<head><title>Enter Message</title></head>');
		res.write(
			// send a new POST request to /message, look into a form and detect any inputs and put that message into a request to our server
			'<body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">Send</button></form></body>'
		);
		res.write('</html>');
		// return will prevent a function to continue a code below from running
		return res.end();
	}

	// only enter this if statement if we have a POST request to a /message
	if (url === '/message' && method === 'POST') {
		// before sending the response and writing to the file we want to get our request data
		// data event will be fired whenever a new chunk of data is ready to be read

		// create an empty array
		const body = [];
		// on(event, function to be executed for every incoming request)
		req.on('data', chunk => {
			// this will log Buffer with chunks of a file/message that we recieved from a response, we cannot work with it at that state, we'll have to convert it
			console.log(chunk);
			// push our data into an array
			body.push(chunk);
		});
		// end event will be fired once it's done parsing the incoming request data
		return req.on('end', () => {
			// this will create a new variable and will add up all chunks from the body, and convert them so string using toString
			const parsedBody = Buffer.concat(body).toString();
			console.log(parsedBody);

			// parsedBody returns message=(whatever message we passed in)
			// now we want to split it by taking an element on the right [1] of the equal sign (=), which is an input that user typed in
			const message = parsedBody.split('=')[1];
			console.log(message);

			// create new fille with a message that user entered in an input
			// writeFileSync will block execution of the next lines of code until this file is done writing
			// fs.writeFileSync('message.txt', message);
			// we should use writeFile instead, (third argument is a callback function that should be executed when it's done writing a file), callback function can recieve an error as an argument, which we can handle if something goes wrong
			fs.writeFile('message.txt', message, err => {
				console.log(err);
				res.statusCode = 302;
				// redurect user back to /
				res.setHeader('Location', '/');
				return res.end();
			});
		});
	}

	res.setHeader('Content-Type', 'text/html');
	// write some data to response
	res.write('<html>');
	res.write('<head><title>My first page</title></head>');
	res.write('<body><h1>hello from nodejs server</h1></body>');
	res.write('</html>');
	// tell node that we're done with creating a response
	res.end();
});

server.listen(3000);

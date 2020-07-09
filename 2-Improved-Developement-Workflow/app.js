const http = require('http');

const routes = require('./routes');

const server = http.createServer(routes);

server.listen(3000);

// type npm init in terminal to create npm package, then npm start to run a server
// npm install nodemon --save-dev will install package to help with restarting a server
// --save-dev will install it as a developement package
// --save as production dependency
// -g globally on your pc
// now if we change "start": "nodemon app.js" in package.json, and run npm start, our server will auto refresh after every change

// you can delete node_modules folder to free up space if you're not working on a project, and then simply run npm install, to install all required dependencies

const path = require('path');

// mainModule.filename will point to a file that is responsible for running our application, this will pretty much point to an app.js
// path.dirname will give us a path to that file
module.exports = path.dirname(process.mainModule.filename);

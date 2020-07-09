// console.log('hello from node js');

// fs - files system functionalities, such as writing to files from your computer
const fs = require('fs');

// creates a new file (file name, file contents)
fs.writeFileSync('hello.txt', 'hello from node js');

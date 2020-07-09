// path module to point to a html file in a request
const path = require('path');

const express = require('express');
const rootDir = require('../util/path');
const router = express.Router();

router.get('/', (req, res, next) => {
	// console.log('this always runs');
	// send a response
	// res.send('<h1>hello from express</h1>');

	// send an actual html file as a response
	// join method will join all arguments returning a correct path to a file
	// (__divname is a path to this whole project folder,
	// .. - leave our project folder and go up one level,
	// views - folder we want to get into,
	// shop.html - file that we want to get from that folder)

	// res.sendFile(path.join(__dirname, '..', 'views', 'shop.html'));
	res.sendFile(path.join(rootDir, 'views', 'shop.html'));
});

module.exports = router;

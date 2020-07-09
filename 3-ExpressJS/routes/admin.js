const path = require('path');
const express = require('express');
const router = express.Router();
const rootDir = require('../util/path');

// /admin/add-product => GET
router.get('/add-product', (req, res, next) => {
	// console.log('in another middleware');
	// res.send(
	// 	'<form action="/admin/add-product" method="POST"><input type="text" name="title"><button type="submit">add product</button></form>'
	// );

	// res.sendFile(path.join(__dirname, '..', 'views', 'add-product.html'));
	res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
});

// this function will execute for /product when we submit a form
// app.get will only run for incoming GET requests, and app.post for POST
// /admin/add-product => POST
router.post('/add-product', (req, res, next) => {
	// redirect and log incoming data to console
	console.log(req.body);
	res.redirect('/');
});

module.exports = router;

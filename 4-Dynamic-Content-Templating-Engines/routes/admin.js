const path = require('path');

const express = require('express');

const rootDir = require('../util/path');

const router = express.Router();

// an array to store products that we recieve from form input
const products = [];

// /admin/add-product => GET
router.get('/add-product', (req, res, next) => {
	// res.sendFile(path.join(rootDir, 'views', 'add-product.html'));

	// render a templating engine
	res.render(
		'add-product',
		// pass an object that stores data that is passed as variables into that template
		{
			pageTitle: 'Add Product',
			path: '/admin/add-product',
			formsCSS: true,
			productCSS: true,
			activeAddProduct: true,
		}
	);
});

// /admin/add-product => POST
router.post('/add-product', (req, res, next) => {
	// console.log(req.body);

	// push an object containing form input
	products.push({ title: req.body.title });
	res.redirect('/');
});

// module.exports = router;
exports.routes = router;
exports.products = products;

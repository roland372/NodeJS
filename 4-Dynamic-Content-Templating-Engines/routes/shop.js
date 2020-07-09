const path = require('path');

const express = require('express');

const rootDir = require('../util/path');
const adminData = require('./admin');

const router = express.Router();

router.get('/', (req, res, next) => {
	// console.log('shop.js', adminData.products);
	// res.sendFile(path.join(rootDir, 'views', 'shop.html'));

	// grab the products
	const products = adminData.products;
	// render a pug templating engine
	// pass products and title to pug template, so we can access it and work with it
	res.render('shop', {
		products: products,
		pageTitle: 'Shop',
		path: '/',
		// pass the condition to engine
		hasProducts: products.length > 0,
		activeShop: true,
		productCSS: true,
	});
});

module.exports = router;

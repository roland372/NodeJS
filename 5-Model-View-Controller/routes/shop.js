const path = require('path');

const express = require('express');

const productsController = require('../controllers/products');

const router = express.Router();

// router.get('/', (req, res, next) => {
// 	const products = adminData.products;
// 	res.render('shop', {
// 		prods: products,
// 		pageTitle: 'Shop',
// 		path: '/',
// 		hasProducts: products.length > 0,
// 		activeShop: true,
// 		productCSS: true,
// 	});
// });

router.get('/', productsController.getProducts);

module.exports = router;

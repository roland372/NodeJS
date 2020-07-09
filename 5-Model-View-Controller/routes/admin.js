const path = require('path');

const express = require('express');

// import controllers
const productsController = require('../controllers/products');

const router = express.Router();

// /admin/add-product => GET
// router.get('/add-product', (req, res, next) => {
//   res.render('add-product', {
//     pageTitle: 'Add Product',
//     path: '/admin/add-product',
//     formsCSS: true,
//     productCSS: true,
//     activeAddProduct: true
//   });
// });

// pass controller, store a function, and execure it wherever a request reaches this route
router.get('/add-product', productsController.getAddProduct);

// /admin/add-product => POST
// router.post('/add-product', (req, res, next) => {
// 	products.push({ title: req.body.title });
// 	res.redirect('/');
// });

router.post('/add-product', productsController.postAddProduct);

module.exports = router;

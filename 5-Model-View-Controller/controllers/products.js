// import a class
const Product = require('../models/product');
const { fetchAll } = require('../models/product');

// export a controller that handles products
exports.getAddProduct = (req, res, next) => {
	res.render('add-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		formsCSS: true,
		productCSS: true,
		activeAddProduct: true,
	});
};

exports.postAddProduct = (req, res, next) => {
	// create a new object based on a class blueprint
	// pass title that we just submited as an argument
	const product = new Product(req.body.title);
	// call this method to save/push this product to an array
	product.save();
	res.redirect('/');
};

exports.getProducts = (req, res, next) => {
	// fetch all products
	// fetchAll takes a function it should execute once it's done fetching, and then we get a products and then we render our response with those products
	Product.fetchAll(products => {
		res.render('shop', {
			prods: products,
			pageTitle: 'Shop',
			path: '/',
			hasProducts: products.length > 0,
			activeShop: true,
			productCSS: true,
		});
	});
};

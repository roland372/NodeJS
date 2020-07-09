const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
	Product.fetchAll()
		.then(([rows, fieldData]) => {
			res.render('shop/product-list', {
				prods: rows,
				pageTitle: 'All Products',
				path: '/products',
			});
		})
		.catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;
	// after finding a product
	Product.findById(prodId)
		// extract it
		.then(([product]) => {
			// and render
			res.render('shop/product-detail', {
				product: product[0],
				pageTitle: product.title,
				path: '/products',
			});
		})
		.catch(err => {
			console.log(err);
		});
};

exports.getIndex = (req, res, next) => {
	// grab all products
	Product.fetchAll()
		// [first element, second element] from our nested array
		.then(([rows, fieldData]) => {
			// when we get data, we want to render the page
			res.render('shop/index', {
				prods: rows,
				pageTitle: 'Shop',
				path: '/',
			});
		})
		// catch errors
		.catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
	Cart.getCart(cart => {
		Product.fetchAll(products => {
			const cartProducts = [];
			for (product of products) {
				const cartProductData = cart.products.find(
					prod => prod.id === product.id
				);
				if (cartProductData) {
					cartProducts.push({ productData: product, qty: cartProductData.qty });
				}
			}
			res.render('shop/cart', {
				path: '/cart',
				pageTitle: 'Your Cart',
				products: cartProducts,
			});
		});
	});
};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findById(prodId, product => {
		Cart.addProduct(prodId, product.price);
	});
	res.redirect('/cart');
};

exports.postCartDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findById(prodId, product => {
		Cart.deleteProduct(prodId, product.price);
		res.redirect('/cart');
	});
};

exports.getOrders = (req, res, next) => {
	res.render('shop/orders', {
		path: '/orders',
		pageTitle: 'Your Orders',
	});
};

exports.getCheckout = (req, res, next) => {
	res.render('shop/checkout', {
		path: '/checkout',
		pageTitle: 'Checkout',
	});
};

const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
	// grab all products
	Product.findAll()
		.then(products => {
			// when we get products, render the page
			res.render('shop/product-list', {
				prods: products,
				pageTitle: 'All Products',
				path: '/products',
			});
		})
		.catch(err => {
			console.log(err);
		});

	// Product.fetchAll()
	// 	.then(([rows, fieldData]) => {
	// 		res.render('shop/product-list', {
	// 			prods: rows,
	// 			pageTitle: 'All Products',
	// 			path: '/products',
	// 		});
	// 	})
	// 	.catch(err => console.log(err));
};

// get single product
exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;

	// find by condition
	// Product.findAll({
	// 	// find product where id is equal to prodId
	// 	where: {
	// 		id: prodId,
	// 	},
	// })
	// 	.then(products => {
	// 		res.render('shop/product-detail', {
	// 			product: products[0],
	// 			pageTitle: products[0].title,
	// 			path: '/products',
	// 		});
	// 	})
	// 	.catch(err => {
	// 		console.log(err);
	// 	});

	// find product
	// sequelize already returns a single product, and not an array of products like mysql, so we don't have to extract it, just return
	Product.findByPk(prodId)
		.then(product => {
			// and then render
			res.render('shop/product-detail', {
				product: product,
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
	Product.findAll()
		.then(products => {
			// when we get products, render the page
			res.render('shop/index', {
				prods: products,
				pageTitle: 'Shop',
				path: '/',
			});
		})
		.catch(err => {
			console.log(err);
		});

	// // grab all products
	// Product.fetchAll()
	// 	// [first element, second element] from our nested array
	// 	.then(([rows, fieldData]) => {
	// 		// when we get data, we want to render the page
	// 		res.render('shop/index', {
	// 			prods: rows,
	// 			pageTitle: 'Shop',
	// 			path: '/',
	// 		});
	// 	})
	// 	// catch errors
	// 	.catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
	req.user
		.getCart()
		.then(cart => {
			return cart
				.getProducts()
				.then(products => {
					res.render('shop/cart', {
						path: '/cart',
						pageTitle: 'Your Cart',
						products: products,
					});
				})
				.catch(err => {
					console.log(err);
				});
		})
		.catch(err => {
			console.log(err);
		});
	// Cart.getCart(cart => {
	// 	Product.fetchAll(products => {
	// 		const cartProducts = [];
	// 		for (product of products) {
	// 			const cartProductData = cart.products.find(
	// 				prod => prod.id === product.id
	// 			);
	// 			if (cartProductData) {
	// 				cartProducts.push({ productData: product, qty: cartProductData.qty });
	// 			}
	// 		}
	// 		res.render('shop/cart', {
	// 			path: '/cart',
	// 			pageTitle: 'Your Cart',
	// 			products: cartProducts,
	// 		});
	// 	});
	// });
};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	let fetchedCart;
	let newQuantity = 1;
	req.user
		.getCart()
		.then(cart => {
			fetchedCart = cart;
			// find if product we're looking for is already a part of the cart
			return (
				cart
					.getProducts({
						where: {
							id: prodId,
						},
					})
					.then(products => {
						let product;
						if (products.length > 0) {
							product = products[0];
						}
						// when we add a product to a cart, that is already in a cart
						if (product) {
							const oldQuantity = product.cartItem.quantity;
							// increment quantity
							newQuantity = oldQuantity + 1;
							return product;
						}
						return Product.findByPk(prodId);
					})
					// when we add a product for the first time
					.then(product => {
						return fetchedCart.addProduct(product, {
							through: { quantity: newQuantity },
						});
					})
					.then(() => {
						res.redirect('/cart');
					})
					.catch(err => {
						console.log(err);
					})
			);
		})
		.catch(err => {
			console.log(err);
		});
};

exports.postCartDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	req.user
		.getCart()
		.then(cart => {
			return cart.getProducts({ where: { id: prodId } });
		})
		.then(products => {
			const product = products[0];
			// remove item from cart
			return product.cartItem.destroy();
		})
		.then(result => {
			res.redirect('/cart');
		})
		.catch(err => {
			console.log(err);
		});
};

exports.postOrder = (req, res, next) => {
	let fetchedCart;
	// take all cart items and move them to order
	req.user
		.getCart()
		.then(cart => {
			// once we get a cart, store it in a variable
			fetchedCart = cart;
			return cart.getProducts();
		})
		.then(products => {
			return req.user
				.createOrder()
				.then(order => {
					return order.addProducts(
						products.map(product => {
							// get quantity of the item and store it in a order
							product.orderItem = { quantity: product.cartItem.quantity };
							return product;
						})
					);
				})
				.catch(err => console.log(err));
		})
		.then(result => {
			// clear the cart after we pass all items to an order
			return fetchedCart.setProducts(null);
		})
		.then(result => {
			res.redirect('/orders');
		})
		.catch(err => {
			console.log(err);
		});
};

exports.getOrders = (req, res, next) => {
	// get user orders
	req.user
		.getOrders({ include: ['products'] })
		.then(orders => {
			res.render('shop/orders', {
				path: '/orders',
				pageTitle: 'Your Orders',
				orders: orders,
			});
		})
		.catch(err => {
			console.log(err);
		});
};

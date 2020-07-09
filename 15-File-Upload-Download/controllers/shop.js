// file system to handle files (read/write)
const fs = require('fs');
const path = require('path');

// grab pdfkit
const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
	Product.find()
		.then(products => {
			console.log(products);
			res.render('shop/product-list', {
				prods: products,
				pageTitle: 'All Products',
				path: '/products',
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;
	Product.findById(prodId)
		.then(product => {
			res.render('shop/product-detail', {
				product: product,
				pageTitle: product.title,
				path: '/products',
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getIndex = (req, res, next) => {
	Product.find()
		.then(products => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'Shop',
				path: '/',
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getCart = (req, res, next) => {
	req.user
		.populate('cart.items.productId')
		.execPopulate()
		.then(user => {
			const products = user.cart.items;
			res.render('shop/cart', {
				path: '/cart',
				pageTitle: 'Your Cart',
				products: products,
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findById(prodId)
		.then(product => {
			return req.user.addToCart(product);
		})
		.then(result => {
			console.log(result);
			res.redirect('/cart');
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postCartDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	req.user
		.removeFromCart(prodId)
		.then(result => {
			res.redirect('/cart');
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postOrder = (req, res, next) => {
	req.user
		.populate('cart.items.productId')
		.execPopulate()
		.then(user => {
			const products = user.cart.items.map(i => {
				return { quantity: i.quantity, product: { ...i.productId._doc } };
			});
			const order = new Order({
				user: {
					email: req.user.email,
					userId: req.user,
				},
				products: products,
			});
			return order.save();
		})
		.then(result => {
			return req.user.clearCart();
		})
		.then(() => {
			res.redirect('/orders');
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getOrders = (req, res, next) => {
	Order.find({ 'user.userId': req.user._id })
		.then(orders => {
			res.render('shop/orders', {
				path: '/orders',
				pageTitle: 'Your Orders',
				orders: orders,
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getInvoice = (req, res, next) => {
	// get orderId
	const orderId = req.params.orderId;
	// make sure that only authenticated user is able to request an invoice of their orders

	// find order
	Order.findById(orderId)
		.then(order => {
			// if we don't find any orders
			if (!order) {
				// return an error
				return next(new Error('No order found.'));
			}
			// if we have an order but unauthorized user is requesting an order
			if (order.user.userId.toString() !== req.user._id.toString()) {
				return next(new Error('Unauthorized'));
			}

			// construct invoice file name
			const invoiceName = 'invoice-' + orderId + '.pdf';
			// construct path to invoice
			const invoicePath = path.join('data', 'invoices', invoiceName);

			// generate a new pdf document when we get an invoice, based on our order
			const pdfDoc = new PDFDocument();
			// set header, telling our browser that we're dealing with pdf file
			res.setHeader('Content-Type', 'application/pdf');
			// specify how the file should be displayed
			// attachment instead of inline, will download file
			res.setHeader(
				'Content-Disposition',
				'inline; filename="' + invoiceName + '"'
			);

			// files will be streamed in chunks, step by step
			pdfDoc.pipe(fs.createWriteStream(invoicePath));
			// return it to a client
			pdfDoc.pipe(res);

			// invoice header
			pdfDoc.fontSize(26).text('Invoice', {
				underline: true,
			});

			// specify what we want to write into pdf file
			// add a single line of text into our pdf file
			pdfDoc.text('-----------------------');
			// set initial total price
			let totalPrice = 0;
			// loop through all items that are the part of the order
			order.products.forEach(prod => {
				// calculate total price
				totalPrice += prod.quantity * prod.product.price;
				pdfDoc
					.fontSize(14)
					.text(
						prod.product.title +
							' - ' +
							prod.quantity +
							' x ' +
							'$' +
							prod.product.price
					);
			});
			pdfDoc.text('---');
			pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

			// tell pdfDoc, that we're done writing into a file
			pdfDoc.end();
			// use fs to read a file(file path)
			// fs.readFile(invoicePath, (err, data) => {
			// check if we have any errors
			//   if (err) {
			//     return next(err);
			//   }
			//  give browser information, to handle pdf files, allow them to be opened in a browser
			//   res.setHeader('Content-Type', 'application/pdf');
			//   res.setHeader(
			// specify how the file should be displayed
			// attachment instead of inline, will download file
			//     'Content-Disposition',
			//     'inline; filename="' + invoiceName + '"'
			//   );
			//   res.send(data);
			// });
			// files will be downloaded in chunks, step by step
			// const file = fs.createReadStream(invoicePath);

			// file.pipe(res);
		})
		.catch(err => next(err));
};

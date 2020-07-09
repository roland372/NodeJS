const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
	});
};

exports.postAddProduct = (req, res, next) => {
	const title = req.body.title;
	const imageUrl = req.body.imageUrl;
	const price = req.body.price;
	const description = req.body.description;

	// mysql
	// 	const product = new Product(null, title, imageUrl, description, price);
	// 	product
	// 		.save()
	// 		// save to database once we insert values into input
	// 		.then(() => {
	// 			res.redirect('/');
	// 		})
	// 		.catch(err => console.log(err));

	// sequelize
	// create will create a new element based on a model and will immediately save it to a database
	// we're able to call createProduct on user, because we added a relation between user and product
	req.user
		.createProduct({
			// pass arguments
			// id will be inserted by database, we don't have to pass it
			title: title,
			price: price,
			imageUrl: imageUrl,
			description: description,
		})
		.then(result => {
			// console.log(result);
			// console.log('Created Product');
			res.redirect('/admin/products');
		})
		.catch(err => {
			console.log(err);
		});
};

exports.getEditProduct = (req, res, next) => {
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}
	const prodId = req.params.productId;

	// Product.findByPk(prodId)
	// find products by only currently logged in user
	req.user
		.getProducts({ where: { id: prodId } })
		.then(products => {
			const product = products[0];
			if (!product) {
				return res.redirect('/');
			}
			res.render('admin/edit-product', {
				pageTitle: 'Edit Product',
				path: '/admin/edit-product',
				editing: editMode,
				product: product,
			});
		})
		.catch(err => {
			console.log(err);
		});
};

// gets called once we submit updage product in edit
exports.postEditProduct = (req, res, next) => {
	const prodId = req.body.productId;
	const updatedTitle = req.body.title;
	const updatedPrice = req.body.price;
	const updatedImageUrl = req.body.imageUrl;
	const updatedDesc = req.body.description;
	// update product in database
	Product.findByPk(prodId)
		// this will not directly edit it in a database, only locally
		.then(product => {
			product.title = updatedTitle;
			product.price = updatedPrice;
			product.description = updatedDesc;
			product.imageUrl = updatedImageUrl;
			// to update database we need to call save()
			return product.save();
		})
		// this block will handle any succesfull responses fron prev promise
		.then(result => {
			console.log('Product updated');
			res.redirect('/admin/products');
		})
		.catch(err => {
			console.log(err);
		});
};

exports.getProducts = (req, res, next) => {
	req.user
		.getProducts()
		.then(products => {
			res.render('admin/products', {
				prods: products,
				pageTitle: 'Admin Products',
				path: '/admin/products',
			});
		})
		.catch(err => {
			console.log(err);
		});
};

exports.postDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findByPk(prodId)
		.then(product => {
			return product.destroy();
		})
		.then(result => {
			console.log('Product DESTROYED');
			res.redirect('/admin/products');
		})
		.catch(err => {
			console.log(err);
		});
};

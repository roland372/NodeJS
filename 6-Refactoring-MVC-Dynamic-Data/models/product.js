// import fs to be able to save files
const fs = require('fs');
// to construct a path
const path = require('path');

// path to our file
const p = path.join(
	// target root directory (where our project is)
	path.dirname(process.mainModule.filename),
	// point to a folder where we want to save
	'data',
	// point to a file where we want to save
	'products.json'
);

// helper function to read a file
const getProductsFromFile = callback => {
	// read a file contents
	fs.readFile(p, (err, fileContent) => {
		// if we get an error
		if (err) {
			// return an empty array, because it means we have no products
			callback([]);
		} else {
			// if we got no error, return this file and parse it, otherwise it just will be a string and not an array
			callback(JSON.parse(fileContent));
		}
	});
};

// class model that will handle a single product
module.exports = class Product {
	constructor(id, title, imageUrl, description, price) {
		this.id = id;
		this.title = title;
		this.imageUrl = imageUrl;
		this.description = description;
		this.price = price;
	}

	// methods
	// save products
	save() {
		getProductsFromFile(products => {
			if (this.id) {
				const existingProductIndex = products.findIndex(
					prod => prod.id === this.id
				);
				const updatedProducts = [...products];
				updatedProducts[existingProductIndex] = this;
				fs.writeFile(p, JSON.stringify(updatedProducts), err => {
					console.log(err);
				});
			} else {
				this.id = Math.random().toString();
				products.push(this);
				fs.writeFile(p, JSON.stringify(products), err => {
					console.log(err);
				});
			}
		});
	}

	static deleteById(id) {
		getProductsFromFile(products => {
			const product = products.find(prod => prod.id === id);
			const updatedProducts = products.filter(prod => prod.id !== id);
			fs.writeFile(p, JSON.stringify(updatedProducts), err => {
				if (!err) {
					Cart.deleteProduct(id, product.price);
				}
			});
		});
	}

	// fetch all products
	// static allows to call this method directly on a class, and not only on a created object with new keyword
	static fetchAll(cb) {
		getProductsFromFile(cb);
	}

	// load a signle product
	static findById(id, cb) {
		// get all products
		getProductsFromFile(products => {
			// filter out single product based on it's id
			const product = products.find(p => {
				// check if id of the product matches an id we recieve as an parameter
				// if that's true we will get that product and store it in a product constant
				return p.id === id;
			});
			cb(product);
		});
	}
};

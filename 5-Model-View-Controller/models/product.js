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
	constructor(t) {
		this.title = t;
	}

	// methods
	// save products
	save() {
		getProductsFromFile(products => {
			// then push new product into an array
			products.push(this);
			// save it back to a file at p path as a JSON
			fs.writeFile(p, JSON.stringify(products), err => {
				console.log(err);
			});
		});
	}

	// fetch all products
	// static allows to call this method directly on a class, and not only on a created object with new keyword
	static fetchAll(callback) {
		getProductsFromFile(callback);
	}
};

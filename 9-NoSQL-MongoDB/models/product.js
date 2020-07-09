const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
	constructor(title, price, description, imageUrl, id, userId) {
		this.title = title;
		this.price = price;
		this.description = description;
		this.imageUrl = imageUrl;
		// check if id exists already if true, then create a new id object, and convert it with ObjectId method
		this._id = id ? new mongodb.ObjectId(id) : null;
		this.userId = userId;
	}

	// method to save in database
	save() {
		const db = getDb();
		let dbOp;
		if (this._id) {
			// update product
			dbOp = db.collection('products').updateOne(
				{ _id: this._id },
				// changes we want to make to item we're editing
				// 'this' will replace all fields (title, price, etc.)
				{ $set: this }
			);
		} else {
			dbOp = db.collection('products').insertOne(this);
		}
		// now we have a connection
		// tell mongodb in what collection you want to insert something
		// insertOne or insertMany, for one or multiple documents
		// here we can insert an object, 'this' will refer to our Product class
		return dbOp
			.then(result => {
				console.log(result);
			})
			.catch(err => {
				console.log(err);
			});
	}

	// get products from database
	static fetchAll() {
		const db = getDb();
		// tell mongo to which connection connect to
		return (
			db
				.collection('products')
				// find all products
				.find()
				// get all documents and turn them into javascript array
				.toArray()
				.then(products => {
					console.log(products);
					return products;
				})
				.catch(err => {
					console.log(err);
				})
		);
	}

	// get single product
	static findById(prodId) {
		// get access to db collection
		const db = getDb();
		return (
			db
				.collection('products')
				// return product with matching id
				// we need to use new Object Id, because id's are stored differently in a mongodb
				.find({ _id: new mongodb.ObjectId(prodId) })
				.next()
				.then(product => {
					console.log(product);
					return product;
				})
				.catch(err => console.log(err))
		);
	}

	static deleteById(prodId) {
		const db = getDb();
		return db
			.collection('products')
			.deleteOne({ _id: new mongodb.ObjectId(prodId) })
			.then(result => {
				console.log('DELETED');
			})
			.catch(err => {
				console.log(err);
			});
	}
}

module.exports = Product;

const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

// create a new user model
class User {
	constructor(username, email, cart, id) {
		this.name = username;
		this.email = email;
		this.cart = cart; // {items: []}
		this._id = id;
	}

	// save user to the database
	save() {
		const db = getDb();
		return db.collection('users').insertOne(this);
	}

	// add item to a cart
	addToCart(product) {
		// check if id's are matching, so we know that product exists in a cart
		const cartProductIndex = this.cart.items.findIndex(cp => {
			return cp.productId.toString() === product._id.toString();
		});
		let newQuantity = 1;

		// copy all contents of a cart
		const updatedCartItems = [...this.cart.items];

		// if product already exists in a cart
		if (cartProductIndex >= 0) {
			// increase it's quantity
			newQuantity = this.cart.items[cartProductIndex].quantity + 1;
			updatedCartItems[cartProductIndex].quantity = newQuantity;
			// if it doesn't exist
		} else {
			// add the item to a cart
			updatedCartItems.push({
				productId: new ObjectId(product._id),
				quantity: newQuantity,
			});
		}

		// add a product to cart
		const updatedCart = {
			// what we want to add
			items: updatedCartItems,
		};
		// update an user to store a cart in there
		const db = getDb();
		return db.collection('users').updateOne(
			{ _id: new ObjectId(this._id) },
			// specify what to update
			{ $set: { cart: updatedCart } }
		);
	}

	// return cart with all products
	getCart() {
		const db = getDb();
		const productIds = this.cart.items.map(i => {
			return i.productId;
		});
		return (
			db
				.collection('products')
				// find all products that are in a cart
				.find({ _id: { $in: productIds } })
				.toArray()
				// map over an array of products from database
				.then(products => {
					return products.map(p => {
						return {
							// ... spread all product properties
							...p,
							// add new quantity property
							quantity: this.cart.items.find(i => {
								return i.productId.toString() === p._id.toString();
							}).quantity,
						};
					});
				})
		);
	}

	deleteItemFromCart(productId) {
		// copy and filter cart items
		const updatedCartItems = this.cart.items.filter(item => {
			// we want to keep all items in a cart, except items that we're deleting
			return item.productId.toString() !== productId.toString();
		});

		// update the database
		const db = getDb();
		return db.collection('users').updateOne(
			{ _id: new ObjectId(this._id) },
			// specify what to update
			{ $set: { cart: { items: updatedCartItems } } }
		);
	}

	addOrder() {
		const db = getDb();
		return this.getCart()
			.then(products => {
				const order = {
					items: products,
					user: {
						_id: new ObjectId(this._id),
						name: this.name,
					},
				};
				return db.collection('orders').insertOne(order);
			})
			.then(result => {
				this.cart = { items: [] };
				return db
					.collection('users')
					.updateOne(
						{ _id: new ObjectId(this._id) },
						{ $set: { cart: { items: [] } } }
					);
			});
	}

	getOrders() {
		const db = getDb();
		return db
			.collection('orders')
			.find({ 'user._id': new ObjectId(this._id) })
			.toArray();
	}

	// find the user by id
	static findById(userId) {
		const db = getDb();
		return db
			.collection('users')
			.findOne({
				_id: new ObjectId(userId),
			})
			.then(user => {
				console.log(user);
				return user;
			})
			.catch(err => {
				console.log(err);
			});
	}
}

module.exports = User;

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
// import database
// const db = require('./util/database');
const sequelize = require('./util/database');

// import models
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// execute/run database
// select everyting from products
// db.execute('SELECT * FROM products')
// 	.then(result => {
// 		// result returns an array with two nested arrays, first one containing our data from table, and the second some metadata about a table we fetched from
// 		console.log(result[0], result[1]);
// 	})
// 	// in case something goes wrong, catch an error
// 	.catch(err => {
// 		console.log(err);
// 	});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// reach to database and return an user
app.use((req, res, next) => {
	User.findByPk(1)
		.then(user => {
			// store an user in a request
			req.user = user;
			// we're calling next, so that we can continue with our code after we retrieve an user from db
			next();
		})
		.catch(err => {
			console.log(err);
		});
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// relate models before we synchronize them/ create tables
Product.belongsTo(User, {
	// how this relation should be managed
	constrains: true,
	// when user is deleted, what should happen to connected products
	// CASCADE - when user is deleted, also delete all it's products
	onDelete: 'CASCADE',
});
// optional
User.hasMany(Product);

// add association/relation
User.hasOne(Cart);
Cart.belongsTo(User);
// through - where these relations should be stored
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

// sync will look at all the models we defined ane will create tables in mysql for those models, by default it will NOT overwrite all existing tables
sequelize
	// force:true will overwrite your table on any new changes
	// .sync({ force: true })
	.sync()
	.then(result => {
		// create an user
		// check if we already have an user
		return User.findByPk(1);

		// console.log(result);
		// only start server if our db is running
	})
	.then(user => {
		// if we don't have an user
		if (!user) {
			// create a new user
			return User.create({ name: 'Roland', email: 'test@test.com' });
		}
		// if we have an user, return it
		return user;
	})
	.then(user => {
		// console.log(user);
		// create a cart
		return user.createCart();
	})
	.then(cart => {
		// and start a server
		app.listen(3000);
	})
	.catch(err => {
		console.log(err);
	});

// install mysql, sequelize
// npm install --save mysql2
// npm install --save sequelize

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
// import database
const db = require('./util/database');

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

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000);

// install mysql
// npm install --save mysql2

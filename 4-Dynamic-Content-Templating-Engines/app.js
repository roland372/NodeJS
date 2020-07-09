const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
// import express handlebars

const app = express();

// global configuration value, set templating engine
// compile dynamic templates with the pug engine
// app.set('view engine', 'pug');

// compile dynamic templates with the ejs engine
app.set('view engine', 'ejs');

// where to find these templates
app.set('views', 'views');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
	res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));

	// render a pug templating engine, and pass pageTitle as a data, that we can use in our engine
	res.status(404).render('404', { pageTitle: 'Page Not Found', path: '/404' });
});

app.listen(3000);

// install template engines
// npm install --save ejs pug express-handlebars

const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

// route to checkout
router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/orders', isAuth, shopController.getOrders);

// route to get invoice from orders, isAuth to protect this route, allowing only authenticated users, to request invoice of their orders
router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;

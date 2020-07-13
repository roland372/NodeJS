// code that will not run on a server, but on a client side(browser)

// delete a product without having to reload a page
const deleteProduct = btn => {
	// when we click a button, get access to element next to button (input), so we can get access to csrf token, and to the product id
	// onclick="deleteProduct(this), we need to pass "this", so we can get access to the whole button
	// console.log(btn);
	// console.log('clicked');

	// will give access to parent div of a button
	// console.log(btn.parentNode);

	// get access to input containing productId and it's value

	const prodId = btn.parentNode.querySelector('[name=productId]').value;
	// console.log(prodId);

	// get access to csrf token
	const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
	// console.log(csrf);

	// select whole product element
	// closest will give you closest element to passed selector
	const productElement = btn.closest('article');

	// send http request to our server
	fetch(
		'/admin/product/' + prodId,
		// configure fetch request
		{
			// set a method
			method: 'DELETE',
			// send csrf token, to attach it to your outgoing request
			headers: {
				'csrf-token': csrf,
			},
		}
	)
		.then(result => {
			// console.log(result);
			return result.json();
		})
		// delete an item from dom without having to reload the page
		.then(data => {
			console.log(data);
			// delete product element
			productElement.remove();
		})
		.catch(err => {
			console.log(err);
		});
};

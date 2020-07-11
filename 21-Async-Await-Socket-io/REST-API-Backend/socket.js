// initialize socket.io connection so we can reuse it in other places in our app
let io;

module.exports = {
	init: httpServer => {
		io = require('socket.io')(httpServer);
		return io;
	},
	getIO: () => {
		// check if io does not exists is undefined
		if (!io) {
			throw new Error('Socket.io not initialized');
		}
		return io;
	},
};

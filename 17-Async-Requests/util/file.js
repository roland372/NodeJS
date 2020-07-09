const fs = require('fs');

const deleteFile = filePath => {
	// unlink deletes a file at specified path
	fs.unlink(filePath, err => {
		if (err) {
			throw err;
		}
	});
};

exports.deleteFile = deleteFile;

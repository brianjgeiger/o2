// from http://stackoverflow.com/questions/8579055/how-i-move-files-on-node-js/29105404#29105404

var fs = require('fs');

module.exports = function move (oldPath, newPath, callback) {
    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        callback(null, oldPath, newPath);
    });

    function copy () {
        var readStream = fs.createReadStream(oldPath);
        var writeStream = fs.createWriteStream(newPath);

        readStream.on('error', callback);
        writeStream.on('error', callback);
        readStream.on('close', function () {

        fs.unlink(oldPath, callback);
    });

    readStream.pipe(writeStream);
    }
};

var remote = require('remote');

// Add the listener
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#exit-button').addEventListener('click', function (event) {
        alert("exit");
    });
});

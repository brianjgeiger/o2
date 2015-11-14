var remote = require('remote');
var BrowserWindow = remote.require('browser-window');
var ipc = require('ipc');

ipc.send('did-finish-load');



// Add the listener
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#exitButton').addEventListener('click', function (event) {
        ipc.send('exit');
    });

    document.getElementById('loginForm').addEventListener("submit", processLogin);
    document.getElementById('nodeChooser').addEventListener("submit", processNodeSelection);
});

function processLogin(e) {
    "use strict";
    if (e.preventDefault) {
        e.preventDefault();
    }
    console.log("Login:");
    console.log(e);
    /* do what you want with the form */

    // You must return false to prevent the default form behavior
    return false;
}

function processNodeSelection(e) {
    "use strict";
    if (e.preventDefault) {
        e.preventDefault();
    }
    console.log("NodeSelection:");
    console.log(e);
    /* do what you want with the form */

    // You must return false to prevent the default form behavior
    return false;
}


function chooseNode() {
    "use strict";
    var nodeForm = document.getElementById('nodeChooser');
    console.log("Node chosen");
    console.log(nodeForm);
}

require('ipc').on('getFiles', function(files) {
  var fileList = document.createElement('ul');
  fileList.className = 'a-list';
  for (var i = 0; i < files.length; i++) {
    var fileItem = document.createElement('li');
    fileItem.innerHTML = files[i];
    fileList.appendChild(fileItem);
  }
  document.getElementsByClassName('window-content')[0].appendChild(fileList);
});

require('ipc').on('getNodes', function(nodes) {
    var nodeList = "<select class='form-control'>";
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        nodeList += "<option value='"+ node.id +"'>" + (node.attributes.title + " (" + node.id + ")") + "</option>";
    }
    nodeList += "</select>";
    document.getElementById('nodeList').innerHTML = nodeList;
});

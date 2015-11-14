var remote = require('remote');
var BrowserWindow = remote.require('browser-window');
var ipc = require('ipc');

ipc.send('did-finish-load');



// Add the listener
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#exitButton').addEventListener('click', function (event) {
        ipc.send('exit');
    });
});

function login(){
    "use strict";
    console.log("Login:");

function chooseNode() {
    "use strict";
    var nodeForm = document.getElementById('');
    console.log("Node chosen");
}

require('ipc').on('getNodes', function(nodes) {
    var nodeList = "<select class='form-control'>";
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        nodeList += "<option value='"+ node.id +"'>" + (node.attributes.title + " (" + node.id + ")") + "</option>";
    }
    nodeList += "</select>";
    document.getElementById('nodeList').innerHTML = nodeList;
});

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

    var elements = document.getElementById('loginForm').elements;
    var username = elements[0].value;
    var password = elements[1].value;

    // TODO: form validation handling

    login(username, password);

    return false;
}

function processNodeSelection(e) {
    "use strict";
    if (e.preventDefault) {
        e.preventDefault();
    }

    var options = document.getElementById('nodeChooser').elements[0].options;
    for(var i=0; i<options.length; i++){
        var option = options[i];
        if (option.selected){
            selectNode(option.value);
        }
    }
    return false;
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


function selectNode(nodeId){
    console.log(nodeId);
    ipc.send('did-select-node');
}

function login(username, password){
    console.log('User: ' + username);
    console.log('Pass: ' + password);
    ipc.send('user-login');
}
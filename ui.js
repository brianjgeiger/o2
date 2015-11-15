"use strict";
var remote = require('remote');
var BrowserWindow = remote.require('browser-window');
var ipc = require('ipc');
var uiState = require('./uiState.js');

ipc.send('did-finish-load');



// Add the listener
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#exitButton').addEventListener('click', function (event) {
        ipc.send('exit');
    });
    document.querySelector('#syncButton').addEventListener('click', function (event) {
        ipc.send('sync');
    });

    document.getElementById('loginForm').addEventListener("submit", processLogin);
    document.getElementById('nodeChooser').addEventListener("submit", processNodeSelection);
    setState();
});

function setState(){
    document.getElementById('loginPane').style.display = 'none';
    document.getElementById('nodeLocPane').style.display = 'none';
    document.getElementById('statusPane').style.display = 'none';
    var currentState = uiState.UIState();
    document.getElementById(currentState.id).style.display = 'block';
    if(typeof currentState.message === 'undefined'){
        currentState.message = '';
    }
    document.getElementById('messagePane').innerHTML = currentState.message;

}

require('ipc').on('setEmailField', function(email) {
    document.getElementById('emailField').value = email;
});

require('ipc').on('setLogin', function(state, message) {
    uiState.loginState(state, message);
    setState();
});

require('ipc').on('setNodeLoc', function(state, message) {
    uiState.nodeLocState(state, message);
    setState();
});

require('ipc').on('setToken', function(state, message) {
    uiState.tokenState(state, message);
    setState();
});

require('ipc').on('addStatusMessage', function(message) {
    addStatusMessage(message);
});

var addStatusMessage = function(message){
    if (typeof message !== "undefined"){
        var table = document.getElementById('statusTable');
        var row = table.insertRow(table.rows.length);
        var cell = row.insertCell(0);
        var cellMessage = document.createTextNode(message);
        cell.appendChild(cellMessage);
    }
};

function processLogin(e) {
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

require('ipc').on('getFiles', function(files) {
  for (var key in files) {
    if (files.hasOwnProperty(key)) {
      addStatusMessage(key);
    }
  }
});

require('ipc').on('getNodes', function(nodes) {
    var nodeOptions = document.getElementById('nodeOptions');
    var nodeList = '';
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        nodeList += "<option value='"+ node.id +"'>" + (node.attributes.title + " (" + node.id + ")") + "</option>";
    }
    nodeOptions.innerHTML = nodeList;
});


function selectNode(nodeId){
    ipc.send('did-select-node', nodeId);
}

function login(username, password){
    ipc.send('user-login', {'username': username, 'password': password});
}

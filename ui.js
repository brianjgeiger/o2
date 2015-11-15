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
    "use strict";
    document.getElementById('loginPane').style.display = 'none';
    document.getElementById('nodeLocPane').style.display = 'none';
    document.getElementById('statusPane').style.display = 'none';
    var currentState = uiState.UIState();
    document.getElementById(currentState.id).style.display = 'block';
    document.getElementById('messagePane').innerHTML = currentState.message;
}

require('ipc').on('setLogin', function(state, message) {
    "use strict";
    uiState.loginState(state, message);
    setState();
});

require('ipc').on('setNodeLoc', function(state, message) {
    "use strict";
    uiState.nodeLocState(state, message);
    setState();
});

require('ipc').on('setToken', function(state, message) {
    "use strict";
    uiState.tokenState(state, message);
    setState();
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

function chooseNode() {
    "use strict";
    var nodeForm = document.getElementById('nodeChooser');
    uiState.validNodeLoc(true);
    console.log("Node chosen");
    console.log(nodeForm);
}

require('ipc').on('getFiles', function(files) {
  var fileList = document.createElement('ul');
  fileList.className = 'a-list';
  for (var key in files) {
    if (files.hasOwnProperty(key)) {
      var fileItem = document.createElement('li');
      fileItem.innerHTML = key;
      fileList.appendChild(fileItem);
    }
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


function selectNode(nodeId){
    console.log(nodeId);
    ipc.send('did-select-node');
}

function login(username, password){
    ipc.send('user-login', {'username': username, 'password': password});
}

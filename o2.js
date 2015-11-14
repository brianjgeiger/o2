var menuBar = require('menubar');
var Client = require('node-rest-client').Client;
var shell = require('shell');
var ipc = require('ipc');
var app = require('app');

var mbOptions = {"width": 1000, "height": 800};

var mb = menuBar(mbOptions);
var client = new Client();
var webContents = null;
client.registerMethod("nodes", "https://staging-api.osf.io/v2/nodes/", "GET");
client.registerMethod("my_nodes", "https://staging-api.osf.io/v2/users/me/nodes/?page[size]=100", "GET");

var showNodes = function(nodes){
    "use strict";
    mb.window.send('getNodes', nodes);
};

mb.on('ready', function ready () {
    "use strict";
    ipc.on('did-finish-load',function(){
        client.methods.nodes(function(data, response) {
            var json = JSON.parse(data.toString());
            showNodes(json.data);
        });
    });

    ipc.on('exit', function() {
        app.quit();
    });

    ipc.on('did-select-node', function() {
        console.log('Node selected');
    });


    console.log('app is ready and updating');
});

mb.on('after-create-window', function ready () {
    "use strict";
    webContents = mb.window.webContents;
    mb.window.openDevTools();
    //webContents.on('did-finish-load', function() {
    //    console.log("Content finished loading");
    // });
});
var menuBar = require('menubar');
var Client = require('node-rest-client').Client;
var shell = require('shell');
var ipc = require('ipc');

var mb = menuBar();
var client = new Client();
var webContents = null;
client.registerMethod("nodes", "https://staging-api.osf.io/v2/nodes/", "GET");
client.registerMethod("my_nodes", "https://staging-api.osf.io/v2/users/me/nodes/?page[size]=100", "GET");

var showNodes = function(nodes){
    "use strict";
    console.log("Trying to send nodes");
    console.log(nodes);
    webContents.send('ping', 'whoooooooh!');
    webContents.send('getNodes', nodes);
};

mb.on('ready', function ready () {
    "use strict";
    console.log('app is ready and updating');

});

mb.on('after-create-window', function ready () {
    "use strict";
    console.log("Created window");
    webContents = mb.window.webContents;
    webContents.on('did-finish-load', function() {
        console.log("Content finished loading");
        client.methods.nodes(function(data, response) {
            var json = JSON.parse(data.toString());
            showNodes(json.data);
        });
     });
});
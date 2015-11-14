var menuBar = require('menubar');
var Client = require('node-rest-client').Client;
var shell = require('shell');
var ipc = require('ipc');
var fs = require('fs-promise');
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

var showFiles = function(files){
    "use strict";
    mb.window.send('getFiles', files);
};

mb.on('ready', function ready () {
    "use strict";
    ipc.on('did-finish-load',function(){
        client.methods.nodes(function(data, response) {
            var json = JSON.parse(data.toString());
            showNodes(json.data);
        });
        console.log('Starting file list');
        var path = '/usr/local/etc/';

        var theFiles = fs.readdir(path).then(function(files) {
          var onlyFiles = [];
          for (var i = 0; i < files.length; i++) {
            if(!fs.statSync(path+files[i]).isDirectory()) {
              onlyFiles.push(path+files[i]);
            }
          }
          return onlyFiles;
        }).then(function(files) {
          showFiles(files);
        });
    });

    ipc.on('exit', function() {
        app.quit();
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

var menuBar = require('menubar');
var Client = require('node-rest-client').Client;
var shell = require('shell');
var ipc = require('ipc');
var fs = require('fs-promise');
var app = require('app');

var mbOptions = {"width": 1000, "height": 800};

var mb = menuBar(mbOptions);
var webContents = null;


var showNodes = function(nodes){
    "use strict";
    mb.window.send('getNodes', nodes);
};

var showFiles = function(files){
    "use strict";
    mb.window.send('getFiles', files);
};

var setupClient = function (username, password) {
  var client;
  if((username === null) && (password === null)) {
    client = new Client();
  } else {
    var options_auth = { user: username, password: password };
    client = new Client(options_auth);
  }
  client.registerMethod("nodes", "https://staging-api.osf.io/v2/nodes/", "GET");
  client.registerMethod("my_nodes", "https://staging-api.osf.io/v2/users/me/nodes/?page[size]=100", "GET");
  mb.window._client = client;
};

var getNodes = function () {
  if(!mb.window._client) {
    setupClient();
  }
  mb.window._client.methods.nodes(function(data, response) {
    var json = JSON.parse(data.toString());
    showNodes(json.data);
  });
};

mb.on('ready', function ready () {
    "use strict";
    ipc.on('did-finish-load',function(){
        getNodes();
        console.log('Starting file list');
        var path = process.cwd();

        // readdir requires a trailing slash.
        if (path.substr(path.length-1) != '/') {
          path = path + '/';
        }

        var theFiles = fs.readdir(path).then(function(files) {
          var onlyFiles = {};
          for (var i = 0; i < files.length; i++) {
            var filePath = path + files[i];
            var fileStat = fs.statSync(filePath);
            if(!fileStat.isDirectory()) {
              onlyFiles[path+files[i]] = {'stat': fileStat, 'sha': null};
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

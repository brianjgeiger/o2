var menuBar = require('menubar');
var Client = require('node-rest-client').Client;
var shell = require('shell');
var ipc = require('ipc');
var fs = require('fs-promise');
var app = require('app');
var mbOptions = {"width": 400, "height": 400};

var mb = menuBar(mbOptions);
var webContents = null;


var showNodes = function(nodes){
    "use strict";
    console.log('sending getNodes to ui');
    mb.window.send('getNodes', nodes);
};

var showFiles = function(files){
    "use strict";
    mb.window.send('getFiles', files);
};

ipc.on('user-login', function(ev, auth) {
  console.log('caught user-login');
  setupClient(auth.username, auth.password);
  getNodes();
});

var setupClient = function (username, password) {
    "use strict";
  var client;
  if((username === null) && (password === null)) {
    client = new Client();
      mb.window.send('setLogin', false);
  } else {
    var options_auth = { user: username, password: password };
    client = new Client(options_auth);
      mb.window.send('setLogin', true, 'Logged in.');
  }
  client.registerMethod("nodes", "https://staging-api.osf.io/v2/nodes/", "GET");
  client.registerMethod("my_nodes", "https://staging-api.osf.io/v2/users/me/nodes/?page[size]=100", "GET");
  mb.window._client = client;
  console.log('Client setup.');
};

var getNodes = function () {
  console.log('Getting Nodes');
  if(!mb.window._client) {
    setupClient();
  }
  console.log('making http request');
  mb.window._client.methods.my_nodes(function(data, response) {
    var json = JSON.parse(data.toString());
    console.log('got http response');
    showNodes(json.data);
  });
};



mb.on('ready', function ready () {
    "use strict";
    ipc.on('did-finish-load',function(){
        // getNodes();
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

    ipc.on('sync', function() {
        console.log("We should sync");
        mb.window.send('addStatusMessage', "Syncing now…");
    });

    ipc.on('did-select-node', function() {
        console.log('Node selected');
        mb.window.send('setNodeLoc', true);
    });


    console.log('app is ready and updating');
});

mb.on('after-create-window', function ready () {
    "use strict";
    webContents = mb.window.webContents;
    //mb.window.openDevTools();
});

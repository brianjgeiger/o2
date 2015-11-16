var menuBar = require('menubar');
var Client = require('node-rest-client').Client;
var shell = require('shell');
var ipc = require('ipc');
var fs = require('fs-promise');
var app = require('app');
var _ = require('underscore');
var sanitize = require('sanitize-filename');
var nodePath = require('path');
var foldToAscii = require('fold-to-ascii');
var ConfigStore = require('configstore');
var pkg = require('./package.json');
var nodeRequest = require('request');
var dialog = require('dialog');

var mbOptions = {"width": 400, "height": 400};

var appSettings = new ConfigStore(pkg.name);
var userSettings = null;
var mb = menuBar(mbOptions);
var webContents = null;

var baseUrl = 'https://staging-api.osf.io/v2/';


var showNodes = function(nodes) {
    "use strict";
    console.log('sending getNodes to ui');
    mb.window.send('getNodes', nodes);
};

var getNodeFiles = function(nodeId) {
  console.log('Getting node files');
  var files = {};
  mb.window._client.methods.nodeFiles({'path':{'id': nodeId}}, function(data, response) {
    var fileData = JSON.parse(data.toString());
    var increment = 1;
    _.each(fileData.data, function(file) {
      var safeFilename;
      var sanitizedName = sanitize(foldToAscii.fold(file.attributes.name));
      var currentFilenames = _.keys(files);
      if(_.contains(currentFilenames, sanitizedName)) {
        var parsedName = nodePath.parse(sanitizedName);
        safeFilename = parsedName.name+'_'+increment+parsedName.ext;
        increment+=1;
      } else {
        safeFilename = sanitizedName;
      }
      if (safeFilename !== file.attributes.name) {
        var args = {
            'data': {
              'action': 'rename',
              'rename': safeFilename
            },
            'headers': {
              'Content-Type': 'application/vnd.api+json'
            }
        };
        mb.window._client.post(file.links.move, args, function(data, response) {
          var parsedData = JSON.parse(data.toString());
          mb.window.send('addStatusMessage', 'Renamed '+ parsedData.data.id+' to '+parsedData.data.attributes.name);
        });
      }
      files[safeFilename] = _.extend(file.attributes, file.links);
    });
    getRemoteFiles(files);
  });
};

var getRemoteFiles = function(files) {
  var tempDir = app.getPath('temp');
  console.log('Temp directory is: ', tempDir);
  _.each(files, function(file) {
    // get the file payload from osf
    mb.window._client.get(file.download, function(data, response) {
      // create a local stream
      var filePointer = fs.createWriteStream(nodePath.join(tempDir, file.name));
      // get the file body from the ☁️
      nodeRequest.get(response.headers.location).pipe(filePointer);
    });
  });
};

var showFiles = function(files){
    "use strict";
    mb.window.send('getFiles', files);
};

ipc.on('user-login', function(ev, auth) {
  console.log('caught user-login');
  setupClient(auth.username, auth.password);
  appSettings.set('lastUsername', auth.username);
  getNodes();
});

var setupClient = function (username, password) {
    "use strict";
  var client;
  if((username === null) && (password === null) || (username === '') && (password === '')) {
    client = new Client();
      mb.window.send('setLogin', false);
  } else {
    var options_auth = { user: username, password: password };
    client = new Client(options_auth);
    client.registerMethod('me', baseUrl+'users/me/', 'GET');
    client.methods.me(function(data, response) {
        var json = JSON.parse(data.toString());
        var user_id = json.data.id;
        userSettings = new ConfigStore(pkg.name+user_id);
        mb.window.send('setLogin', true, 'Logged in.');
    });
  }
  client.registerMethod("nodes", baseUrl+"nodes/", "GET");
  client.registerMethod("myNodes", baseUrl+"users/me/nodes/?page[size]=100", "GET");
  client.registerMethod("nodeOptions", baseUrl+'nodes/${id}', 'OPTIONS');
  client.registerMethod('nodeFiles', baseUrl+'nodes/${id}/files/osfstorage/?filter[kind]=file&page[size]=100', 'GET');

  mb.window._client = client;
  console.log('Client setup.');
};

var getNodes = function () {
  console.log('Getting Nodes');
  if(!mb.window._client) {
    setupClient();
  }
  console.log('making http request');
  mb.window._client.methods.myNodes(function(data, response) {
    var json = JSON.parse(data.toString());
    console.log('got http response');
    showNodes(json.data);
  });
};

mb.on('ready', function ready () {
    "use strict";

    ipc.on('did-finish-load',function(){
        var email = appSettings.get('lastUsername');
        mb.window.send('setEmailField', email);
        // getNodes();
        console.log('Starting file list');
        var path = process.cwd();

        // readdir requires a trailing slash.
        if (path.substr(path.length-1) !== '/') {
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

    ipc.on('did-select-node', function(ev, nodeId, parentFolder, nodeTitle) {
        userSettings.set('currentNode', 'nodeId');
        userSettings.set('syncFolder', parentFolder + nodeTitle);
        mb.window.send('setNodeLoc', true);
        getNodeFiles(nodeId);
    });

    ipc.on('choose-local-folder', function(){
       dialog.showOpenDialog(mb.window, {properties: ['openDirectory']}, function (folderPath) {
           mb.window.send('setLocalFolder', folderPath);
        });
    });


    console.log('app is ready and updating');
});

mb.on('after-create-window', function ready () {
    "use strict";
    webContents = mb.window.webContents;
     //mb.window.openDevTools();
});
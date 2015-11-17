"use strict";

// Collections of sync items
function Collection(collectionId) {
    var self = this;
    self.collectionId = collectionId;
    self.items = [];

}

Collection.prototype.addItem = function(item){

};

Collection.prototype.findMatch = function(comparisonItem){

};


// Sync Items
function Item(data) {
    var self = this;

    var validKeys = ['name', 'location', 'kind', 'size', 'dateModified', 'dateCreated', 'md5', 'sha256'];

    for(var i=0; i<validKeys.length; i++){
        self[validKeys[i]] = null;
    }

    self.extras = {};

    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            if (validKeys.indexOf(key) !== -1) {
                self[key] = data[key];
            } else {
                self.extras[key] = data[key];
            }
        }
    }
}



// Sync item logs
function Log(data) {
    var self = this;

}

exports.Item = Item;
exports.Collection = Collection;
exports.Log = Log;
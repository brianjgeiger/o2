"use strict";
var expect = require("chai").expect;
var SyncSystem = require("../syncSystem.js");



describe("SyncSystem Item.", function (){
    describe("Initialization.", function (){

        it("Stores expected fields at the top level.", function(){
            var item = new SyncSystem.Item({'name': 'itemName'});
            expect(item.name).to.equal('itemName');
        });

        it("Stores unexpected fields in extras.", function(){
            var item = new SyncSystem.Item({'foo': 'bar'});
            expect(item.extras.foo).to.equal('bar');
        });
    });


});
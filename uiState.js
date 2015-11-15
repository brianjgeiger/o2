var self = this;

self.currentState = {
    validLogin: false,
    validToken: false,
    validNodeLoc: false
};

self.lastMessage = undefined;

var loginState = function(valid, msg){
    "use strict";
    if(typeof valid === "undefined"){
        return self.currentState.validLogin;
    }
    self.currentState.validLogin = valid;
    self.lastMessage = msg;
};

var tokenState = function (valid, msg){
    "use strict";
    if(typeof valid === "undefined"){
        return self.currentState.validToken;
    }
    self.currentState.validToken = valid;
    self.lastMessage = msg;
};

var nodeLocState = function (valid, msg){
    "use strict";
    if(typeof valid === "undefined"){
        return self.currentState.validNodeLoc;
    }
    self.currentState.validNodeLoc = valid;
    self.lastMessage = msg;
};

var UIState = function(){
    "use strict";
    var state = {
        id: 'statusPane',
        message: ''
    };
    if (typeof self.lastMessage !== undefined){
        state.message = self.lastMessage;
    }
    if(!loginState()){
        state.id = 'loginPane';
    }
    else if(!nodeLocState()){
        state.id = 'nodeLocPane';
    }
    return state;
};

exports.UIState = UIState;
exports.loginState = loginState;
exports.tokenState = tokenState;
exports.nodeLocState = nodeLocState;

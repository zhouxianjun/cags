'use strict';
const ring = require("ring");
const gs = require("../../index");
const Abstract = gs.AbstractHandler;
module.exports = ring.create([Abstract], {
    cmd: 0x0001,
    run: function(length, cmd, result, body){
        let user = this.getUser();
        if(user){
            user.heartTime = new Date().getTime();
            this.write(new gs.Packet().useLog(console).createSuccess(this.cmd));
        }
    }
});
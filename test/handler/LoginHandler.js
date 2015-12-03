'use strict';
const ring = require("ring");
const gs = require("../../index");
const Abstract = gs.AbstractHandler;
const User = require("../dto/User");
module.exports = ring.create([Abstract], {
    cmd: 0x0002,
    run: function(length, cmd, result, body){
        let user = this.getUser();
        if(!user){
            user = new User();
            user.id = 'xxx';
            user.name = 'Gary';
            user.heartTime = new Date().getTime();
            this.login(user);
        }
    }
});
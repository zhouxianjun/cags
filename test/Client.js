/**
 * Created by zhouxianjun on 2016/1/13.
 */
'use strict';
const logger = require('tracer').dailyfile({
    root:'../logs',
    format : [
        "{{timestamp}} <{{title}}>  [{{file}}:{{line}}:{{pos}}] - {{message}}", //default format
        {
            error : "{{timestamp}} <{{title}}>  [{{file}}:{{line}}:{{pos}}] - {{message}}\nCall Stack:\n{{stack}}" // error format
        }
    ],
    dateformat : "HH:MM:ss.L",
    preprocess :  function(data){
        data.title = data.title.toUpperCase();
    },
    transport: function(data){
        console.log(data.output);
    }
});
//导入通信包
const socket = require('simple-net');
var Client = socket.TCPClient;
var MyClient = Client.$extend({
    sendHeartbeat: function(client){
        console.log('发送心跳...');
        new gs.Packet().createSuccess(0x0002).write(client);
        //client.write(buffer);
    }
});
let c = new MyClient({
    port: 1234, //端口
    reconnect: false, //是否重连
    heartbeat: true, //是否开启心跳
    logger: logger
}).addHandler(new socket.coder.LengthDecoder(2, 'B')).connect();
//导入游戏包
const gs = require('../index');
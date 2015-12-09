/**
 * Created with JetBrains Idea.
 * User: Gary
 * Date: 2015/11/24
 * Time: 15:21
 * To change this template use File | Settings | File Templates.
 *                 _ooOoo_
 *                o8888888o
 *                88" . "88
 *                (| -_- |)
 *                O\  =  /O
 *             ____/`---'\____
 *           .'  \\|     |//  `.
 *           /  \\|||  :  |||//  \
 *           /  _||||| -:- |||||-  \
 *           |   | \\\  -  /// |   |
 *           | \_|  ''\---/''  |   |
 *           \  .-\__  `-`  ___/-. /
 *         ___`. .'  /--.--\  `. . __
 *      ."" '<  `.___\_<|>_/___.'  >'"".
 *     | | :  `- \`.;`\ _ /`;.`/ - ` : | |
 *     \  \ `-.   \_ __\ /__ _/   .-` /  /
 *======`-.____`-.___\_____/___.-`____.-'======
 *                   `=---='
 *^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *           佛祖保佑       永无BUG
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
//导入游戏包
const gs = require('../index');
//使用长度解码器
const BasicLengthDecoder = gs.BasicLengthDecoder;
//获取一个TCP服务端
const Server = socket.TCPServer;
new Server({
    logger: logger
}).addHandler(new BasicLengthDecoder(2, logger).useFileSystem('./handler')).start(1234);
//初始化世界管理器,玩家超时时间为1分钟
gs.WorldManager.init(60 * 1000);

//启动RPC服务器之间的通讯服务,并监听其他服务器发送的信息
let rpcServer = new gs.RPC.Server();
rpcServer.useLog(logger).useFileSystem('./thriftHandler').onReceiveMsg(function(packet, id){
    console.log('收到服务器发送信息:CMD:0x' + packet.cmd);
}).start(1111);
//向指定服务器发送信息
rpcServer.sendToServer('192.168.5.16', 1111, new gs.RPCServerTypes.Packet({
    cmd: 0x0001
}));
//获取指定服务器服务并且执行函数
rpcServer.getService('192.168.5.16', 1111, 'Server', gs.RPCServer).then(function(service){
    service.receiveMsg(new gs.RPCServerTypes.Packet({
        cmd: 0x0002
    })/**有返回值的function(err, res){}*/);
});

const Memcached = require('memcached');
const TestCacheMgr = require('./manager/TestCacheManager');
//创建一个缓存管理器
let testCacheMgr = gs.util.Class.getObject(TestCacheMgr, new Memcached('192.168.5.16'));
//获取该缓存管理器数据
testCacheMgr.getAll().then(function(data){
    console.log(data);
}).catch(function(err){
    if(err){
        console.error(err);
    }
});

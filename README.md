

# 如何安装

[Node.js](http://nodejs.org).

[![NPM](https://nodei.co/npm/simple-net.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/simple-net/)

npm install cags

# 注意

<font color=red> 该项目目前未全部完成</font>

---

# 如何使用

## TCP Server
```javascript
//引用通信模块
var socket = require('simple-net');
//引用游戏服务器模块
var cags = require('cags');
//使用长度解码器
var BasicLengthDecoder = cags.BasicLengthDecoder;
//获取TCP服务类
var Server = socket.TCPServer;
//实例化TCP服务 这里使用的是链式操作
//addHandler: 新增一个数据接收解码处理器
new Server({
    logger: logger
}).addHandler(new BasicLengthDecoder(2, logger).useFileSystem('./handler')).start(1234);
//初始化世界管理器,玩家超时时间为1分钟
cags.WorldManager.init(60 * 1000);

//启动RPC服务器之间的通讯服务,并监听其他服务器发送的信息
var rpcServer = new cags.RPC.Server();
rpcServer.useLog(logger).useFileSystem('./thriftHandler').onReceiveMsg(function(packet, id){
    console.log(packet.cmd);
}).start(1111);
//向指定服务器发送信息
rpcServer.sendToServer('192.168.5.16', 1111, new cags.RPCServerTypes.Packet({
    cmd: 0x0001
}));
//获取指定服务器服务并且执行函数
rpcServer.getService('192.168.5.16', 1111, 'Server', cags.RPCServer).then(function(service){
    service.receiveMsg(new cags.RPCServerTypes.Packet({
        cmd: 0x0002
    })/**有返回值的function(err, res){}*/);
});

const Memcached = require('memcached');
const TestCacheMgr = require('./manager/TestCacheManager');
//创建一个缓存管理器 如果不传入memcached则使用本地缓存
let testCacheMgr = cags.util.Class.getObject(TestCacheMgr, new Memcached('192.168.5.16'));
//获取该缓存管理器数据
testCacheMgr.getAll().then(function(data){
    console.log(data);
}).catch(function(err){
    if(err){
        console.error(err);
    }
});
```
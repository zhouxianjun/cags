'use strict';

const path = require("path");
const domain = require('domain').create();
const ring = require("ring");
const walk = require('walk');
const ProtoBuf = require("protobufjs");
const LengthDecoder = require('simple-net').coder.LengthDecoder;
const ProtobufUtil = require('../util/ProtobufUtil');
const Result = ProtobufUtil.load('Result').build();
const AbstractHandler = require('../AbstractHandler');
const ClassUtil = require('../util/ClassUtil');
/**
 * @module BasicLengthDecoder
 */
module.exports = ring.create([LengthDecoder], {
    /**
     * @property {Map} handlers - 所有CMD处理器
     */
    handlers: {},
    /**
     * @property {BasicUser} user - 已登录的用户,调用 login函数
     */
    user: null,
    /**
     * 构造函数,重写了simple-net.LengthDecoder
     * @override
     */
    init: function(){
        this.$super.apply(this, arguments);
        domain.on('error', this.handleException.bind(this));
    },
    /**
     * 当信息收到时触发
     * @param {buffer} buffer - 数据
     * @param {int} length - 数据长度
     */
    onReceive: function(buffer, length){
        let buf = new ProtoBuf.ByteBuffer(length + 2, ProtoBuf.ByteBuffer.BIG_ENDIAN);
        buf.append(buffer);
        let offset = 2; //-length
        //当前请求CMD
        const cmd = buf.readShort(offset);
        offset += 2; //cmd 长度
        //消息RET 长度
        const retSize = buf.readShort(offset);
        offset += 2; //retSize 长度
        //消息RET
        const ret = buf.readBytes(retSize, offset);
        offset += retSize; //ret 长度
        let result;
        try {
            result = Result.decode(ret);
        } catch (err) {
            let tmp = new Result.encode();
            result = Result.decode(tmp);
        }
        //消息body
        const bodyLen = length - 4 - retSize;
        const body = buf.readBytes(bodyLen, offset);
        if(this.logger)
            this.logger.info("接收到消息:CMD:0x%d, ip:%s, port:%d, 总长度:%d, ret长度:%d, body长度:%d, code:%d, msg:%s", cmd, this.ip, this.port, length, retSize, bodyLen, result.code, result.msg);
        this.onMsg && this.onMsg.call(this, length, cmd, result, body);
    },
    /**
     * onReceive 处理完毕回调
     * @param {int} length - 长度
     * @param {short} cmd - 指令
     * @param {Result} result - 返回状态
     * @param {buffer} body - 真实数据内容
     */
    onMsg: function(length, cmd, result, body){
        let handler = this.handlers[cmd];
        if(handler != null){
            let proc = new handler(this);
            if(!ring.instance(proc, AbstractHandler)){
                if(this.logger)
                    this.logger.warn("错误的处理器, cmd=0x%d, handler=%s", cmd, proc);
                delete this.handlers[cmd];
                return;
            }
            proc.startTime = new Date().getTime();
            if(this.checkAuthorized(proc)) {
                domain.run(function(){
                    proc.before && proc.before.call(proc, length, cmd, result, body);
                    if (proc.async) {
                        setImmediate(proc.run.bind(proc), length, cmd, result, body);
                    } else {
                        proc.run.call(proc, length, cmd, result, body);
                    }
                });
            }
        }else{
            if(this.logger)
                this.logger.warn("收到没有处理事件的消息, [IP:PORT = %s:%d,cmd = 0x%d]", this.ip, this.port, cmd);
        }
    },
    /**
     * 连接断开时触发(重写)
     * @param {Socket} socket - socket通信通道
     * @param {String} ip
     * @param {int} port
     */
    onDisconnection: function(socket, ip, port){
        if (this.handlers){
            for(let cmd in this.handlers){
                let handler = this.handlers[cmd];
                if (handler.disconnection){
                    handler.disconnection();
                    return;
                }
            }
        }
    },
    /**
     * 验证权限,通过则调用CMD处理器
     * @param {AbstractHandler} handler - CMD处理器
     * @returns {boolean}
     */
    checkAuthorized: function(handler){
        if(handler.auth && !this.user){
            return false;
        }
        return true;
    },
    /**
     * 异常时调用
     * @param {Error} err - 异常信息
     */
    handleException: function(err){
        if(this.logger){
            this.logger.warn("处理CMD异常, [IP:PORT = %s:%d] %s", this.ip, this.port, err);
        }
    },
    /**
     * 添加一个CMD处理器
     * @param {AbstractHandler} handler - CMD处理器
     * @param {string} name - 名称
     * @returns {BasicLengthDecoder}
     */
    addCmdHandler: function(handler, name){
        if(handler && name){
            let cmd = handler.__properties__.cmd;
            this.handlers[cmd] = handler;
            if(this.logger)
                this.logger.info("注册Handler<%s>--CMD:0x%d", name, cmd);
        }
        return this;
    },
    /**
     * 删除一个CMD处理器
     * @param {short} cmd - 指令
     * @param {string} name - 名称
     * @returns {BasicLengthDecoder}
     */
    delCmdHandler: function(cmd, name){
        if(this.handlers[cmd] && name){
            delete this.handlers[cmd];
            if(this.logger)
                this.logger.info("注销Handler<%s>--CMD:0x%d", name, cmd);
        }
        return this;
    },
    /**
     * 启用文件系统Handler模式
     * @param {string} dir - 文件夹路径
     * @param {Array} dirFilters - 文件夹过滤
     * @returns {BasicLengthDecoder}
     */
    useFileSystem: function(dir, dirFilters){
        let self = this;
        function onFile(root, fileStat){
            let base = path.join(root, fileStat.name);
            try{
                let tmp = ClassUtil.reload(fileStat.name, base);
                if(tmp.__properties__.cmd && typeof tmp.__properties__.run === 'function'){
                    self.addCmdHandler(tmp, fileStat.name.substring(0, fileStat.name.length - '.js'.length));
                }
                tmp = null;
            }catch (err){
                if(this.logger)
                    this.logger.error('加载Handler:%s事件处理器异常.', fileStat.name, err);
            }
        }
        let walker = walk.walk(dir, {
            followLinks: true,
            filters: dirFilters || ['node_modules']
        });
        walker.on("file", function(root, fileStat, next){
            onFile(root, fileStat);
            next();
        });
        walker.on("errors", function(root, nodeStatsArray, next) {
            nodeStatsArray.forEach(function (n) {
                if(this.logger)
                    this.logger.error("[ERROR] " + n);
            });
            next();
        });
        walker.on("end", function(){
            if(this.logger)
                this.logger.info('文件handler加载完成!');
        });
        ClassUtil.watch(dir, function(f, prev){
            onFile(path.dirname(f), this);
        }, function(f, prev){
            if(require.cache[f]){
                let name = this.name.substring(0, this.name.length - '.js'.length);
                self.delCmdHandler(require.cache[f].exports.__properties__.cmd, name);
                delete require.cache[f];
            }
        });
        return this;
    }
});
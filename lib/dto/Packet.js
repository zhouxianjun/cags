'use strict';
const ring = require("ring");
const ProtoBuf = require("protobufjs");
const ProtobufUtil = require('../util/ProtobufUtil');
const Result = ProtobufUtil.load('Result').build();
/**
 * @module Packet
 */
module.exports = ring.create({
    /**
     * @property {short} cmd - 指令
     */
    cmd: undefined,
    /**
     * @property {buffer} body - 内容
     */
    body: undefined,
    /**
     * @property {Date} startTime - 开始时间
     */
    startTime: undefined,
    _result: undefined,
    _resultByte: null,
    /**
     * @property {int} headSize - 头长度大小
     */
    headSize: 2,
    _logger: null,
    /**
     * 返回状态信息code、msg
     * @returns {Result}
     */
    get result(){
        if(!this._result){
            this._result = new Result();
            this._resultByte = this._result.encode();
        }
        return this._result;
    },
    /**
     * 使用日志
     * @param {*} log - 日志
     * @returns {Packet}
     */
    useLog(log){
        this._logger = log;
        return this;
    },
    /**
     * 设置状态
     * @param {Result} val - 状态对象 protobuf
     */
    set result(val){
        if(ProtobufUtil.isMessage(val)) {
            this._result = val;
            this._resultByte = val.encode();
        }else{
            console.warn('result type require protobuf Message!');
        }
    },
    /**
     * 获取当前包大小
     * @returns {number}
     */
    getSize(){
        if(!this.cmd){
            throw new Error('cmd is not null!');
        }
        let size = this.headSize + 2;// cmd + head
        size += this._resultByte.toBuffer().length;
        this.body && (size += this.body.toBuffer().length);
        return size;
    },
    /**
     * 获取包ByteBuffer
     * @returns {ByteBuffer}
     */
    getBuffer(){
        let size = this.getSize();
        if(size < 0){
            return null;
        }
        let buffer = new ProtoBuf.ByteBuffer(size + this.headSize, ProtoBuf.ByteBuffer.BIG_ENDIAN);
        buffer['writeInt' + 8 * this.headSize](size, 0); //length
        buffer.writeShort(this.cmd, this.headSize);
        let retLen = this._resultByte.toBuffer().length;
        buffer.writeShort(retLen, this.headSize + 2);
        if(retLen > 0){
            buffer.append(this._resultByte);
        }
        this.body && buffer.append(this.body);
        return buffer;
    },
    /**
     * 发送
     * @param {Socket} socket - 通信断
     * @param {*} user - 用户标识
     * @param {Date} start - 开始时间
     */
    write(socket, user, start){
        if(socket){
            let buffer = this.getBuffer().toBuffer();
            socket.write(buffer);
            if(this._logger){
                this._logger.info('回复消息：IP:%s, PORT:%d, 对象:%s, CMD:0x%d, code:%d, msg: %s, 总大小:%d, ret:%d, body:%d, 耗时:%d毫秒',
                socket.remoteAddress, socket.remotePort, user, this.cmd, this.result.code,
                    this.result.msg, buffer.length, this._resultByte.toBuffer().length, this.body ? this.body.toBuffer().length : 0,
                start ? new Date().getTime() - start : -1);
            }
        }
    },
    /**
     * 创建一个正确状态的包
     * @param {short} cmd - 指令
     * @param {buffer} body - 内容
     * @returns {Packet}
     */
    createSuccess(cmd, body){
        this.cmd = cmd;
        this.body = body;
        return this;
    }
});
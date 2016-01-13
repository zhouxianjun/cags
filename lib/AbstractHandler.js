'use strict';
const ring = require("ring");
const worldManager = require("./WorldManager");
const Packet = require("./dto/Packet");
const BasicUser = require('./dto/BasicUser');
/**
 * @module AbstractHandler
 */
module.exports = ring.create({
    /**
     * @property {short} cmd - 指令
     */
    cmd: undefined,
    /**
     * @property {boolean} async - 是否异步
     * @default
     */
    async: false,
    /**
     * @property {boolean} auth - 是否需要认证
     * @default
     */
    auth: false,
    /**
     * @property {function} before - before function
     */
    before: undefined,
    /**
     * @property {*} coder - 解码器
     */
    coder: null,
    constructor: function(coder){
        this.coder = coder;
    },
    /**
     * @interface
     * @param {int} length
     * @param {short} cmd
     * @param {Result} result
     * @param {buffer} body
     */
    run: function(length, cmd, result, body){
        throw new TypeError('this is abstract class.');
    },
    /**
     * 用户登录系统
     * @param {BasicUser} user
     */
    login: function(user){
        user.channel = this.coder.socket;
        this.coder.user = user;
        worldManager.userOnline(user);
    },
    /**
     * 当编码器接收到离线消息时触发
     */
    disconnection(){
        if (this.coder.user) {
            if(ring.instance(this.coder.user, BasicUser) && this.coder.user.state !== BasicUser.ONLINE) {
                return;
            }
            worldManager.userOffline(this.coder.user);
        }
    },
    /**
     * 获取已登录用户
     * @returns {null|BasicUser}
     */
    getUser: function(){
        return this.coder.user;
    },
    /**
     * 给当前用户发送信息包
     * @param {Packet} packet - 信息包
     */
    write: function(packet){
        if(ring.instance(packet, Packet)){
            packet.write(this.coder.socket, this.getUser() ? this.getUser().id : null, this.startTime);
        }
    }
});
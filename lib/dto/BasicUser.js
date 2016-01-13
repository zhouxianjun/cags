/**
 * Created with JetBrains Idea.
 * User: Gary
 * Date: 2015/11/24
 * Time: 18:02
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
const ring = require('ring');
const Packet = require('./Packet');
/**
 * @module BasicUser
 */
let BasicUser = ring.create({
    /**
     * @property {*} id - 用户唯一标识
     */
    id: null, //唯一ID
    /**
     * @property {string} name - 用户名称
     */
    name: null, //名称
    /**
     * @property {Sex} sex - 用户性别 枚举
     */
    sex: null, //性别
    server: null,
    /**
     * @property {Socket} channel - 用户通信通道
     */
    channel: null,
    /**
     * @property {Date} loginTime - 登陆时间
     */
    loginTime: null,
    /**
     * @property {Date} heartTime - 心跳时间
     */
    heartTime: null,
    lastOfflineTime: null,
    /**
     * @property {object} stateListeners - 用户状态事件集合 需要重写赋值
     */
    stateListeners: null,
    isOffline: false,
    state: '',
    /**
     * 向当前用户发送信息包
     * @param {Packet} packet - 信息包
     */
    write: function(packet){
        if(ring.instance(packet, Packet) && this.isOnline()){
            packet.write(this.channel, this.id);
        }
    },
    /**
     * 判断当前用户是否在线状态
     * @returns {boolean}
     */
    isOnline: function(){
        if(!this.channel || this.isOffline)return false;
        return this.channel.writable;
    },
    /**
     * 离线
     */
    offline: function(){
        this.channel.end();
        this.channel.destroy();
        if(!this.isOffline)
            this.stateChanged(BasicUser.OFFLINE);
        this.isOffline = true;
    },
    /**
     * 被踢下线
     * @param {String} ip - 新登录ID
     */
    kickOff(ip){},
    /**
     * 上线
     */
    online: function(){
        this.stateChanged(BasicUser.ONLINE);
    },
    /**
     * 重连
     */
    reconnect: function(){
        this.stateChanged(BasicUser.RECONNECT);
    },
    stateChanged: function(state){
        this.state = state;
        if(this.stateListeners && this.stateListeners.length){
            this.stateListeners.every(function(listener){
                listener[state].call(listener, this);
                return true;
            }, this);
        }
    }
});
BasicUser.ONLINE = 'online';
BasicUser.OFFLINE = 'offline';
BasicUser.RECONNECT = 'reconnect';
module.exports = BasicUser;
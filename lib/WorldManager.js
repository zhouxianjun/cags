/**
 * Created with JetBrains Idea.
 * User: Gary
 * Date: 2015/11/24
 * Time: 16:50
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
const BasicUser = require('./dto/BasicUser');
/**
 * @module WorldManager
 */
module.exports = {
    /**
     * @property {Map<BasicUser>} online - 在线用户
     */
    online: new Map(),
    onlineTimer: null,
    /**
     * @property {int} timeOut - 用户超时移除时间
     * @default
     */
    timeOut: 0,
    /**
     * 初始化函数
     * @param {int} timeOut - 用户超时移除时间
     */
    init: function(timeOut){
        this.timeOut = timeOut;
        if(!this.onlineTimer){
            this.onlineTimer = setInterval(this.checkOnline.bind(this), 60 * 1000);
        }
    },
    checkOnline: function(){
        if(this.online && this.online.size && this.timeOut > 0){
            let nowTime = new Date().getTime();
            for (let user of this.online.values()) {
                if (!user.heartTime || (user.heartTime > 0 && nowTime - user.heartTime > this.timeOut)
                    || (user.lastOfflineTime > 0 && nowTime - user.lastOfflineTime > this.timeOut)) {
                    console.log("定时任务从在线玩家列表移除玩家["+user.id+"-"+user.name+"]");
                    this.userOffline(user);
                }
            }
        }
    },
    /**
     * 用户上线
     * @param {BasicUser} user - 用户
     */
    userOnline: function(user){
        if(ring.instance(user, BasicUser)){
            this.userOffline(user);
            this.online.set(user.id, user);
            user.online();
        }
    },
    /**
     * 用户下线
     * @param {BasicUser} user - 用户
     */
    userOffline: function(user){
        if(ring.instance(user, BasicUser)){
            if(this.online.has(user.id)){
                this.online.get(user.id).offline();
                this.online.delete(user.id);
            }
        }
    },
    /**
     * 判断是否有改用户
     * @param {*} id - 用户唯一标识
     * @returns {boolean}
     */
    hasUser: function(id){
        return this.online.has(id);
    },
    /**
     * 根据用户标识获取
     * @param {*} id - 用户唯一标识
     * @returns {null|BasicUser}
     */
    getUser: function(id){
        return this.online.get(id);
    }
};
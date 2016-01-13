/**
 * Created with JetBrains Idea.
 * User: Gary
 * Date: 2015/11/26
 * Time: 18:28
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
const BasicUser = require('../../index').BasicUser;
module.exports = ring.create([BasicUser], {
    stateListeners: [{
        online: function(user){
            console.log(user.id + '上线了');
        },
        offline: function(user){
            console.log(user.id + '下线了');
        }
    }],
    kickOff(ip){
        console.log('%s 被 ip:%s踢下线。', this.id, ip);
    }
});
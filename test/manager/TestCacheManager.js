/**
 * Created with JetBrains Idea.
 * User: Gary
 * Date: 2015/12/8
 * Time: 17:23
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
const ring = require("ring");
const gs = require("../../index");
const Abstract = gs.AbstractCacheManager;
module.exports = ring.create([Abstract], {
    className: 'C.G.TEST',
    singleKey: 'id',
    getList(){
        return new Promise(function(resolve, reject){
            resolve([{id: 1, name: 'test1'},{id: 2, name: 'test3'}]);
        });
    }
});
/**
 * Created with JetBrains Idea.
 * User: Gary
 * Date: 2015/11/25
 * Time: 14:19
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
/*
var promise = function(ms){
    return new Promise(function(resolve, reject) {
        setTimeout(resolve.bind(this, 'done'), ms);
    });
};
promise(2000).then(function(val){
    yield setTimeout(function(){console.log(111)}, 2000);
    console.log(val);
});*/
const fs = require('fs');
const co = require('co');
co(function *(){
    let res;
    try{
        res = yield (function(){
            return function(cb){
                fs.readFile('./GameServer.js', 'utf-8', cb);
            }
        })();
    }catch(e){
        console.error(e.message);
    }
    //console.log(res);
});

const TestCacheMgr = require('./manager/TestCacheManager');
//创建一个缓存管理器
let testCacheMgr = new TestCacheMgr();
//获取该缓存管理器数据
testCacheMgr.getAll().then(function(data){
    console.log(data);
}).catch(function(err){
    if(err){
        console.error(err);
    }
})
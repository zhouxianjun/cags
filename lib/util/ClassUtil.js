/**
 * Created with JetBrains Idea.
 * User: Gary
 * Date: 2015/11/9
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
const ring = require("ring");
const path = require('path');
/**
 * @module ClassUtil
 */
module.exports = {
    cache: new Map(),
    /**
     * 对ring的class加载缓存处理
     * @param {ring} cls - ring class
     * @returns {*} ring - 实体类
     */
    getObject: function(cls){
        let obj;
        if(cls && typeof cls.$extend === 'function'){
            if(this.cache.has(cls)){
                obj = this.cache.get(cls);
            }else{
                obj = new cls();
                this.cache.set(cls, obj);
            }
            if(ring.instance(obj, cls)){
                return obj;
            }else{
                this.cache.delete(cls);
            }
        }
        return obj;
    },
    /**
     * 文件夹监听
     * @param {string} dir - 根目录
     * @param {function} onChange - 修改事件 fn(resolve, prev) this = curr
     * @param {function} onDelete - 删除事件 fn(resolve, prev) this = curr
     */
    watch: function(dir, onChange, onDelete){
        const watch = require('watch');
        watch.watchTree(dir, function(f, curr, prev){
            if(!(typeof f == "object" && prev === null && curr === null) && curr != null && (curr.isFile() || curr.nlink === 0)){
                let resolve = path.resolve(f);
                if(!curr.name)curr.name = path.basename(resolve);
                if(curr.nlink === 0){
                    if(typeof onDelete === 'function'){
                        onDelete.call(curr, resolve, prev);
                    }
                    return;
                }
                if(typeof onChange === 'function'){
                    onChange.call(curr, resolve, prev);
                }
            }
        });
    },
    /**
     * 重新加载class文件
     * @param {string} name - 文件名
     * @param {string} resolve - 文件绝对地址
     * @param {function} onDelete - 删除监听函数 fn(cache)
     * @returns {*}
     */
    reload: function(name, resolve, onDelete){
        if(name.endsWith('.js')) {
            let pwd = path.relative(__dirname, resolve);
            if (!pwd.startsWith('.') && !pwd.startsWith('/')) {
                pwd = './' + pwd;
            }
            if (require.cache[resolve]) {
                if(typeof onDelete === 'function'){
                    onDelete(require.cache[resolve]);
                }
                delete require.cache[resolve];
            }
            return require(pwd);
        }
    }
};
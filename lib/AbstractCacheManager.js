/**
 * Created with JetBrains Idea.
 * User: Gary
 * Date: 2015/12/7
 * Time: 14:43
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
const _ = require("underscore");
const PREFIX = 'CACHE:OBJECT:MGR';
/**
 * @module AbstractCacheManager
 */
module.exports = ring.create({
    mem: null,
    /**
     * @property {string} className - 缓存KEY类名,必须重写赋值
     */
    className: null,
    /**
     * @property {string} singleKey - 对象唯一标识多个已逗号分隔
     */
    singleKey: null,
    /**
     * @property {string} repeatKey - 对象一对多标识
     */
    repeatKey: null,
    /**
     * 缓存LIST结构KEY
     * @returns {string}
     */
    getListKey(){
        return PREFIX + ':LIST:' + this.className;
    },
    /**
     * 缓存Map结构KEY
     * @returns {string}
     */
    getMapKey(){
        return PREFIX + ':MAP:' + this.className;
    },
    /**
     * 缓存Map<Key,List>结构KEY
     * @returns {string}
     */
    getRepeatMapKey(){
        return PREFIX + ':REPTMAP:' + this.className;
    },
    /**
     * 初始化
     * @param {Memcached} memcached - memcached {@link https://github.com/3rd-Eden/memcached}
     */
    init(memcached){
        this.mem = memcached;
    },
    /**
     * 获取缓存对象class的集合
     * @returns {null|Promise}
     */
    getAll(){
        if (!this.className || !this.mem)throw new ReferenceError('un implement className or mem is null!');
        let self = this;
        return new Promise(function(resolve, reject) {
            self.mem.get(self.getListKey(), function(err, data){
                if (err){
                    reject.call(self, err);
                } else {
                    if (!data){
                        self.load(function () {
                            self.mem.get(self.getListKey(), function(err, data){
                                if (err){
                                    reject.call(self, err);
                                } else {
                                    resolve.call(self, data);
                                }
                            });
                        });
                    } else {
                        resolve.call(self, data);
                    }
                }
            });
        });
    },
    /**
     * @interface
     * @return {null|Promise} - 返回Promise数据,必须实现
     */
    getList(){
        throw new ReferenceError('this is abstract method.');
    },
    /**
     * 排序
     * 若 a 小于 b，在排序后的数组中 a 应该出现在 b 之前，则返回一个小于 0 的值。
     * 若 a 等于 b，则返回 0。
     * 若 a 大于 b，则返回一个大于 0 的值。
     * @param {T} a
     * @param {T} b
     */
    sort(a, b){},
    /**
     * 获取第一个元素
     * @returns {null|Promise}
     */
    first(){
        let p = this.getAll();
        if (!p)return null;
        return new Promise(function(resolve, reject){
            p.then(function(data){
                if (data){
                    resolve(data[0]);
                    return;
                }
                resolve(null);
            }).catch(reject);
        });
    },
    /**
     * 获取最后一个元素
     * @returns {null|Promise}
     */
    last(){
        let p = this.getAll();
        if (!p)return null;
        return new Promise(function(resolve, reject){
            p.then(function(data){
                if (data){
                    resolve(data[data.length - 1]);
                    return;
                }
                resolve(null);
            }).catch(reject);
        });
    },
    /**
     * 获取缓存Map结构数据
     * @return {null|Promise}
     */
    getMap(){
        if (!this.className || !this.mem)throw new ReferenceError('un implement className or mem is null!');
        if (!this.singleKey)new Promise(function(resolve, reject){
            resolve(null);
        });
        let self = this;
        return new Promise(function(resolve, reject){
            self.mem.get(self.getMapKey(), function (err, data) {
                if (err)reject(err);
                if (!data) {
                    self.load(function () {
                        self.mem.get(self.getMapKey(), function(err, data){
                            if (err)reject(err);
                            else resolve(data);
                        });
                    });
                }else {
                    resolve(data);
                }
            });
        });
    },
    /**
     * 获取缓存repeatMap结构数据
     * @param {function(err<Error>, data<Object>): boolean} callback - 回调
     */
    getRepeatMap(){
        if (!this.className || !this.mem)throw new ReferenceError('un implement className or mem is null!');
        if (!this.singleKey)new Promise(function(resolve, reject){
            resolve(null);
        });
        let self = this;
        return new Promise(function(resolve, reject){
            self.mem.get(self.getRepeatMapKey(), function (err, data) {
                if (err)reject(err);
                if (!data) {
                    self.load(function () {
                        self.mem.get(self.getRepeatMapKey(), function(err, data){
                            if (err)reject(err);
                            else resolve(data);
                        });
                    });
                }else {
                    resolve(data);
                }
            });
        });
    },
    /**
     * 获取缓存repeatMapList结构数据
     * @param {string} key - repeatMap的key
     * @param {function(err<Error>, data): boolean} callback - 回调
     */
    getRepeatList(key){
        let self = this;
        return new Promise(function(resolve, reject){
            self.getRepeatMap(function (err, data) {
                if (err)reject(err);
                else resolve(data[key]);
            });
        });
    },
    /**
     * 从service读取数据存入缓存
     */
    load(callback){
        if (!this.className || !this.mem)throw new ReferenceError('un implement className or mem is null!');
        let self = this;
        let p = this.getList();
        if (p){
            p.then(function(list){
                if (list && Array.isArray(list)) {
                    list.sort(self.sort);
                    //把list存入缓存
                    self.mem.set(self.getListKey(), list, self.mem.maxExpiration, function(){});
                    let map = {};
                    let repeatMap = {};
                    let singleKeyArray = self.singleKey ? self.singleKey.split(',') : null;
                    list.forEach(function (item) {
                        //唯一标识存储
                        if (singleKeyArray && Array.isArray(singleKeyArray)) {
                            let keyStr = '';
                            singleKeyArray.forEach(function (str) {
                                if (str in item) {
                                    keyStr += str + '-';
                                }
                            });
                            if (keyStr.endsWith('-')) {
                                keyStr = keyStr.substring(0, keyStr.length - 1);
                            }
                            if (keyStr && keyStr.length) {
                                map[keyStr] = item;
                            }
                        }

                        //一对多存储
                        if (this.repeatKey && this.repeatKey in item) {
                            let tmpKey = item[this.repeatKey];
                            if (!(tmpKey in repeatMap)) {
                                repeatMap[tmpKey] = [];
                            }
                            repeatMap[tmpKey].push(item);
                        }
                    }, self);

                    if (Object.getOwnPropertyNames(map).length) {
                        //把map存入缓存
                        self.mem.set(self.getMapKey(), map, self.mem.maxExpiration, function(){});
                    }

                    if (Object.getOwnPropertyNames(repeatMap).length) {
                        //把repeatMap存入缓存
                        self.mem.set(this.getRepeatMapKey(), repeatMap, self.mem.maxExpiration, function(){});
                    }
                }
                _.isFunction(callback) && callback.call(self, list);
            }).catch(function(){
                _.isFunction(callback) && callback.call(self, null);
            });
        }else{
            _.isFunction(callback) && callback.call(self, null);
        }
    },
    /**
     * 刷新数据
     */
    refresh(){
        if (!this.className || !this.mem)throw new ReferenceError('un implement className or mem is null!');
        this.mem.del(this.getListKey(), function(){});
        this.singleKey && this.mem.del(this.getMapKey(), function(){});
        this.repeatKey && this.mem.del(this.getRepeatMapKey(), function(){});
        this.load();
    }
});
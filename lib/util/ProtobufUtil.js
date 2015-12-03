/**
 * Created with JetBrains Idea.
 * User: Gary
 * Date: 2015/11/24
 * Time: 11:00
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
const path = require("path");
const ProtoBuf = require("protobufjs");
const fs = require('fs');
/**
 * @module ProtobufUtil
 */
module.exports = {
    /**
     * @property {string} path - 文件夹名称
     */
    path: 'protobuf',
    cache: new Map(),
    /**
     * 根据名称加载一个proto协议
     * @param {string} name - 名称
     * @param {boolean} reload - 可选 是否强制重新加载
     * @returns {Builder}
     */
    load: function(name, reload){
        if(this.cache.has(name) && !reload){
            return this.cache.get(name);
        }
        let fileName = name.endsWith('.proto') ? function(){
            let tmp = name;
            name = name.substring(0, name.length - '.proto'.length);
            return tmp;
        } : name + '.proto';
        let filePath = this.getUpPath(__dirname, fileName);
        if(!filePath)
            filePath = this.getPath(process.cwd(), fileName);
        let builder = new Builder(ProtoBuf.loadProtoFile(filePath), name);
        this.cache.set(name, builder);
        return builder;
    },
    /**
     * 判断是否为proto协议对象
     * @param {object} obj - obj
     * @returns {boolean}
     */
    isMessage: function(obj){
        return obj.$type && ProtoBuf.Builder.isMessage(obj.$type);
    },
    /**
     * 向上查找proto文件
     * @param {string} parent - 父目录
     * @param {string} fileName - 文件名
     * @returns {*}
     */
    getUpPath: function(parent, fileName){
        let filePath = path.join(parent, '../', this.path, fileName);
        if(fs.existsSync(filePath)){
            return filePath;
        }
        parent = path.join(parent, '../');
        if(parent === process.cwd()){
            return null;
        }
        return this.getUpPath(parent, fileName);
    },
    /**
     * 向下查找proto文件
     * @param {string} parent - 父目录
     * @param {string} fileName - 文件名
     * @returns {*}
     */
    getPath: function(parent, fileName){
        let filePath = path.join(parent, this.path, fileName);
        if(fs.existsSync(filePath)){
            return filePath;
        }
        let files = fs.readdirSync(parent);
        let self = this;
        files.forEach(function(file){
            file = path.join(parent, file);
            let stats = fs.statSync(file);
            if(stats.isDirectory()){
                filePath = self.getPath(file, fileName);
                if(filePath){
                    return filePath;
                }
            }
        });
        return null;
    }
};
/**
 * @module Builder
 */
const Builder = function(protobuf, name){
    this.protobuf = protobuf;
    this.name = name;
    this.cache = new Map();
};
/**
 * 编译proto协议
 * @param {string} name - Message 名称
 * @param {boolean} rebuild - 可选 是否强制重新编译
 * @returns {*}
 */
Builder.prototype.build = function(name, rebuild){
    name = name || this.name;
    if(this.cache.has(name) && !rebuild){
        return this.cache.get(name);
    }
    let build = this.protobuf.build(name);
    this.cache.set(name, build);
    return build;
};
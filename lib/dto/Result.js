/**
 * Created with JetBrains WebStorm.
 * User: Gary
 * Date: 14-8-21
 * Time: 下午12:28
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
const _ = require('underscore');
const err = require('./ErrorCodeDesc');
const errorCode = err.errorCode;
const errorDesc = err.errorDesc;
/**
 * @module Result
 */
const result = function(){
    _.extend(this, {
        /**
         * @property {boolean} success - 是否成功
         */
        success: false,
        /**
         * @property {Map} data - 额外内容
         */
        data: {},
        /**
         * @property {string} msg - 消息描述
         */
        msg: '',
        /**
         * @property {object} executeResult result:错误码、resultMsg错误信息
         */
        executeResult: {
            result: errorCode.FAIL,
            resultMsg: errorDesc.FAIL
        }
    });
    if(arguments && arguments.length){
        for(var i = 0; i < arguments.length; i++){
            if(_.isBoolean(arguments[i])){
                this.success = arguments[i];
            }else if(_.isObject(arguments[i]) && arguments[i].key && G.isString(arguments[i].key) && arguments[i].value){
                this.data[arguments[i].key] = arguments[i].value;
            }else if(typeof arguments[i] === 'string'){
                this.msg = arguments[i];
            }else if(_.isObject(arguments[i])){
                _.extend(this, arguments[i] || {});
            }else if(_.isNaN(arguments[i])){
                this.setExecuteResult(arguments[i]);
            }
        }
    }
};
/*result.prototype.toJSON = function(){
    return JSON.stringify(this);
};*/
/**
 * 判断是否成功
 * @returns {boolean}
 */
result.prototype.isSuccess = function(){
    return this.success;
};
/**
 * 设置执行错误码对象
 * @param {object|int} executeResult - 错误码对象
 */
result.prototype.setExecuteResult = function(executeResult){
    if(_.isObject(executeResult)){
        this.executeResult = executeResult;
    }else if(_.isNaN(executeResult)){
        this.executeResult = {
            result: executeResult,
            resultMsg: errorCode.getDesc(executeResult)
        };
    }
    this.success = this.executeResult.result == errorCode.SUCCESS;
};
/**
 * 添加额外数据
 * @param {string} key - 键
 * @param {*} value - 值
 */
result.prototype.addData = function(key, value){
    this.data[key] = value;
    return this;
};
/**
 * 获取额外数据
 * @param {string} key - 键
 * @returns {*}
 */
result.prototype.getData = function(key){
    return this.data[key];
};
module.exports = result;
/**
 * Created with JetBrains WebStorm.
 * User: Gary
 * Date: 14-8-21
 * Time: 下午1:03
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
const errorCode = {
        FAIL: 0,
        SUCCESS: 1,
        EXISTING: 11,
        PARAM_FAIL: 400,
        NOT_FOUND: 404,
        UNKNOWN_ERROR: 500,
        UN_AUTHORIZED: 401,
        NO_ACCESS: 403,
        getDesc: function (code) {
            for (let key in this) {
                if (this[key] == code) {
                    return errorDesc[key];
                }
            }
            return '';
        }
    },
    errorDesc = {
        FAIL: '操作失败',
        SUCCESS: '操作成功',
        EXISTING: '已存在',
        PARAM_FAIL: '参数验证失败',
        NOT_FOUND: '未找到',
        UNKNOWN_ERROR: '未知错误',
        UN_AUTHORIZED: '未授权',
        NO_ACCESS: '禁止访问:没有访问的权限'
    };
module.exports = {
    errorCode: errorCode,
    errorDesc: errorDesc
};
/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2020/10/13
 *
 * http://doc.bmob.cn/data/wechat_app_new/index.html#_1
 * npm install hydrogen-js-sdk
 */

const secretKey = '50034c39eed3aa68'
const apiCode = '008800'

// 打开 main.js
import Bmob from "hydrogen-js-sdk";
import Vue from 'vue'
import bmob from "@/bmob/bmob"

Bmob.initialize(secretKey, apiCode);

// 挂载到全局使用
Vue.prototype.Bmob = Bmob

// 安装插件
Vue.use(bmob)

> 2020-10-13

# Bmob

http://doc.bmob.cn/data/wechat_app_new/index.html#_1

## 1.安装

```
npm install hydrogen-js-sdk
```

## 2.引入

```
import Bmob from "hydrogen-js-sdk";
```

## 3.初始化

请在`Bmob`应用控制台的`设置`->`安全验证`->`API安全码`

```
Bmob.initialize("你的Secret Key", "你的API 安全码");
```

```javascript
// 安装
npm install hydrogen-js-sdk

// 打开 main.js
import Vue from 'vue'
import Bmob from "hydrogen-js-sdk";

Bmob.initialize("你的Secret Key", "你的API 安全码");

// 挂载到全局使用
Vue.prototype.Bmob = Bmob

// 项目其他页面使用跟小程序一样使用Bmob对象即可，例如：
Bmob.User.login('username','password').then(res => {
   console.log(res)
 }).catch(err => {
  console.log(err)
});
```

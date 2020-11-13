/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2020/10/13
 * Bmob插件, 管理所有表的操作.
 * 封装了表的常用操作
 *
 * 通过`this.$bmob.表名`或`this.$bmob[表名]`的方式操作
 */

/*
.then(res => {
  console.log(res)
}).catch(err => {
   if (err) {
      console.log(err)
    }
  console.log(err)
})
*/

import Bmob from "hydrogen-js-sdk"
import RQuery from "@/bmob/query"
import Page from "@/bmob/page"
import Util from "@/VueCore/angcyo/js/util"

function RBmob() {
  //2020-10-14
}

/**智能识别参数类型*/
function _parseArgs(args) {
  let _arg = {}

  //智能识别参数类型
  for (let i = 0; i < args.length; i++) {
    let arg = args[i]

    //console.log(arg)
    //console.log(typeof arg)

    if (typeof arg === 'undefined') {
      continue
    }

    if (Util.isString(arg)) {
      //字符串类型
      _arg.str = arg
    }

    if (arg._isVue) {
      //Vue对象
      _arg.vue = arg
    } else if (Util.isNumber(arg.requestPage) || Util.isNumber(arg.pageSize)) {
      //Page对象
      _arg.page = arg
    } else if (Util.isArray(arg.ops) ||
        Util.isArray(arg.contains) ||
        Util.isObject(arg.order) ||
        Util.isFunction(arg.queryConfig)) {
      //RQuery对象
      _arg.rQuery = arg
    } else if (Util.isFunction(arg)) {
      //回调函数
      _arg.callback = arg
    } else if (Util.isArray(arg)) {
      //数组
      _arg.args = arg
    } else if (Util.isObject(arg)) {
      //对象
      _arg.obj = arg
    } else {
      //其他
      _arg.arg = arg
    }
  }

  //默认处理
  if (_arg.callback === undefined) {
    _arg.callback = function () {
      console.log('默认的回调处理, 参数如下↓')
      console.log(arguments)
    }
  }

  return _arg
}

/**操作的表名*/
RBmob.prototype.tableName = ''

/**@return 返回表的数据条数*/
RBmob.prototype.countAsync = async function (vue, rQuery) {
  let _args = _parseArgs(arguments)
  const query = Bmob.Query(this.tableName)

  if (_args.rQuery) {
    //调用方法, 将this重新指向为[rQuery], 参数:query
    RQuery.config.call(_args.rQuery, query)
    //RQuery.config.apply(rQuery, [query])
    //RQuery.config.bind(rQuery)(query)
  }
  // let result
  // query.count().then(res => {
  //   console.log(res)
  //   result(res)
  // }).catch(err => {
  // if (err) {
  //   console.log(err)
  // }
  //   result(0)
  // })
  // return await new Promise(resolve => {
  //   result = resolve
  // })
  try {
    return query.count()
  } catch (e) {
    console.log('err->')
    console.log(e)
    return 0
  }
}

/**范围查询结果的数量*/
RBmob.prototype.count = function (vue, rQuery, callback) {
  let _args = _parseArgs(arguments)
  const query = Bmob.Query(this.tableName)

  if (_args.rQuery) {
    //调用方法, 将this重新指向为[rQuery], 参数:query
    RQuery.config.call(_args.rQuery, query)
  }
  query.count().then(res => {
    _args.callback(res, undefined)
  }).catch(err => {
    if (err) {
      console.log(err)
    }
    _args.callback(undefined, err)
  })
}

/**
 * @param query Bmob.Query
 * @param obj 需要保存的数据对象
 * */
function _saveQueryObj(query, obj) {
  for (let key in obj) {
    if (typeof key === 'string'
        && obj.hasOwnProperty(key)) {
      let value = obj[key]
      //vue.log(key + ":" + obj[key])
      if (value !== undefined) {
        query.set(key, value)
      }
    }
  }
}

/**增加一条记录
 * @param vue Vue对象
 * @param obj 需要添加的数据对象
 * @param callback 回调方法, 传入参数(res,err)
 * http://doc.bmob.cn/data/wechat_app_new/index.html#_19
 * */
RBmob.prototype.add = function (vue, obj, callback) {
  let _args = _parseArgs(arguments)
  const query = Bmob.Query(this.tableName)
  _saveQueryObj(query, _args.obj)
  query.save().then(res => {
    _args.callback(res, undefined)
  }).catch(err => {
    if (err) {
      console.log(err)
    }
    _args.callback(undefined, err)
  })
}

/**
 * 批量增加记录
 * http://doc.bmob.cn/data/wechat_app_new/index.html#_36
 * */
RBmob.prototype.batchAdd = function (vue, objs, callback) {
  let _args = _parseArgs(arguments)

  if (_args.args.length > 0) {

    const saveArray = []
    _args.args.forEach(obj => {
      const query = Bmob.Query(this.tableName)
      _saveQueryObj(query, obj)
      saveArray.push(query)
    })

    Bmob.Query(this.tableName).saveAll(saveArray).then(res => {
      _args.callback(res, undefined)
    }).catch(err => {
      if (err) {
        console.log(err)
      }
      _args.callback(undefined, err)
    })
  } else {
    _args.callback(undefined, {error: "未设置添加的数据"})
  }
}

/**如果不存在, 增加一条记录, 否则报错.
 * @param vue Vue对象
 * @param obj 需要添加的数据对象
 * @param rQuery 查询条件参数, 参考query.js
 * @param callback 回调方法, 传入参数(res,err)
 * http://doc.bmob.cn/data/wechat_app_new/index.html#_19
 * */
RBmob.prototype.addOfNotExist = function (vue, obj, rQuery, callback) {
  let _args = _parseArgs(arguments)
  const query = Bmob.Query(this.tableName)

  let objectId = _args.str

  if (_args.rQuery) {
    //如果有查询条件
    RQuery.config.call(_args.rQuery, query)

    query.find().then(res => {
      if (res instanceof Array && res.length > 0) {
        //已存在
        _args.callback(undefined, {error: _args.rQuery.error || "数据已存在"})
      } else {
        this.add(_args.vue, _args.obj, _args.callback)
      }
    }).catch(err => {
      if (err) {
        console.log(err)
      }
      _args.callback(undefined, err)
    })
  } else if (objectId) {
    //传入了objectId
    query.get(objectId).then(res => {
      //已存在
      _args.callback(undefined, {error: _args.rQuery.error || "数据已存在"})
    }).catch(err => {
      if (err) {
        console.log(err)
      }
      //未找到对象
      this.add(_args.vue, _args.obj, _args.callback)
    })
  } else {
    this.add(_args.vue, _args.obj, _args.callback)
  }
}

/**更新一条记录, 如果修改的对象`objectId`不存在, 那么就会保存一个新对象
 * @param vue Vue对象
 * @param obj 需要添加的数据对象, 需要有`objectId`才能更新, 否则就是添加
 * @param callback 回调方法, 传入参数(res,err)
 * http://doc.bmob.cn/data/wechat_app_new/index.html#_20
 * */
RBmob.prototype.updateOrAdd = function (vue, obj, callback) {
  let _args = _parseArgs(arguments)
  const query = Bmob.Query(this.tableName)

  if (obj.objectId) {
    query.set('id', obj.str) //需要修改的objectId
  }

  for (let key in _args.obj) {
    if (typeof key === 'string'
        && _args.obj.hasOwnProperty(key)) {
      //_args.vue.log(key + ":" + obj[key])
      query.set(key, obj[key])
    }
  }
  query.save().then(res => {
    _args.callback(res, undefined)
  }).catch(err => {
    if (err) {
      console.log(err)
    }
    _args.callback(undefined, err)
  })
}


/**移除一条记录
 * @param vue Vue对象
 * @param objectId 需要删除的对象id
 * @param callback 回调方法, 传入参数(res,err)
 * http://doc.bmob.cn/data/wechat_app_new/index.html#_22
 * */
RBmob.prototype.remove = function (vue, objectId, callback) {
  let _args = _parseArgs(arguments)
  const query = Bmob.Query(this.tableName)
  query.destroy(_args.arg).then(res => {
    _args.callback(res, undefined)
  }).catch(err => {
    if (err) {
      console.log(err)
    }
    _args.callback(undefined, err)
  })
}

/**批量移除记录
 * @param vue Vue对象
 * @param objectList 需要删除的对象id, 支持直接ids, 或者包含objectId的对象数组
 * @param callback 回调方法, 传入参数(res,err)
 * */
RBmob.prototype.batchRemove = function (vue, objectList, callback) {
  let _args = _parseArgs(arguments)
  if (!_args.args) {
    _args.callback(undefined, {error: "未设置删除的数据"})
    return
  }

  let length = _args.args.length

  let ids = []
  if (length > 0) {
    if (Util.isString(_args.args[0])) {
      ids = _args.args
    } else if (Util.isObject(_args.args[0])) {
      //自动映射数组里面的`objectId`字段
      ids = _args.args.map(item => item.objectId)
    }
  }

  let spmt = this

  let next = function (index) {
    if (index >= length) {
      _args.callback(ids, undefined)
    } else {
      let id = ids[index]
      spmt.remove(vue, id, (res, err) => {
        next(index + 1)
      })
    }
  }

  next(0)
}


/**假删除一条记录
 * @param vue Vue对象
 * @param objectId 需要删除的对象id
 * @param callback 回调方法, 传入参数(res,err)
 * */
RBmob.prototype.delete = function (vue, objectId, callback) {
  let _args = _parseArgs(arguments)
  const query = Bmob.Query(this.tableName)
  query.set('id', _args.arg) //需要修改的objectId
  query.set('delete', true) //api 提示是string类型, 但是其实可以是any类型
  query.save().then(res => {
    _args.callback(res, undefined)
  }).catch(err => {
    if (err) {
      console.log(err)
    }
    _args.callback(undefined, err)
  })
}

/**批量假删除一组数据
 * @param vue Vue对象
 * @param objectList 需要删除的对象id数组
 * @param callback 回调方法, 传入参数(res,err)
 * */
RBmob.prototype.batchDelete = function (vue, objectList, callback) {
  let _args = _parseArgs(arguments)
  let length = _args.args.length
  let spmt = this

  let ids = []
  if (length > 0) {
    if (Util.isString(_args.args[0])) {
      ids = _args.args
    } else if (Util.isObject(_args.args[0])) {
      //自动映射数组里面的`objectId`字段
      ids = _args.args.map(item => item.objectId)
    }
  }

  let next = function (index) {
    if (index >= length) {
      _args.callback(ids, undefined)
    } else {
      let id = ids[index]
      spmt.delete(vue, id, (res, err) => {
        next(index + 1)
      })
    }
  }

  next(0)
}

/**
 * 查询数据
 * @param vue Vue对象
 * @param page 页面请求对象, 参考page.js
 * @param rQuery 查询条件参数, 参考query.js
 * @param callback 回调方法, 传入参数(res,err)
 * http://doc.bmob.cn/data/wechat_app_new/index.html#_23
 * */
RBmob.prototype.query = function (vue, page, rQuery, callback) {
  let _args = _parseArgs(arguments)
  const query = Bmob.Query(this.tableName)

  //默认排序方式
  //query.limit(-1);//默认limit是100
  // 对updatedAt字段降序排列, 最近添加的在第一个位置
  query.order("-updatedAt")

  if (_args.page) {
    //如果定义了page
    Page.config.call(_args.page, query)
  }

  if (_args.rQuery) {
    RQuery.config.call(_args.rQuery, query)
  }

  query.find().then(res => {
    if (res instanceof Array) {
      _args.callback(res, undefined)
    } else {
      _args.callback(res, undefined)
    }
  }).catch(err => {
    if (err) {
      console.log(err)
    }
    _args.callback(undefined, err)
  })
}

/**
 * 查询数据库中, 所有符合条件的数据, 拉库.
 * 由于`Bmob`sdk的限制, 免费版返回数据的带宽是204800 bytes
 * 为了突破这个带宽显示, 并且获取数据库中所有的数据, 采用循环拉取的方式读取数据.
 * */
RBmob.prototype.all = function (vue, page, rQuery, callback) {
  let _args = _parseArgs(arguments)

  //设置一次拉取的数据量
  let _page = _args.page ? _args.page : {...Page}
  if (_page.requestPage === undefined) {
    _page.requestPage = 1
  }

  let rBmob = this

  //需要返回的数据列表
  let dataList = []
  let next = function () {
    rBmob.query(_args.vue, _page, _args.rQuery, (res, err) => {
      if (res) {
        //返回成功
        dataList.push(...res)
        if (res instanceof Array && res.length >= _page.pageSize) {
          //还有下一页, 继续请求
          _page.requestPage++
          next()
        } else {
          _args.callback(dataList, undefined)
        }
      } else {
        //异常, 立即中断
        _args.callback(dataList, undefined)
      }
    })
  }

  //从第一页, 开始拉取
  next()
}

let _bmob = new RBmob()

/**代理属性
 * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 * */
const _bmobHandler = {
  "get": function (obj, prop) {
    let _result = new RBmob()
    _result.tableName = prop //属性名, 就是需要操作的表名
    return _result
  },
  "set": function (obj, prop, value) {
    // The default behavior to store the value
    obj[prop] = value
    return true
  }
}

RBmob.prototype.install = function (Vue) {
  Vue.prototype.$bmob = new Proxy(_bmob, _bmobHandler)
}

export default _bmob

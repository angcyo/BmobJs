/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2020/10/14
 *
 * Bmob 查询参数封装
 *
 * http://doc.bmob.cn/data/wechat_app_new/index.html#_26
 *
 * equalTo 方法支持 "==","!=",">",">=","<","<="
 *
 * 模糊查询目前只提供给付费套餐会员使用
 */

const RQuery = {

  /**
   * 对应[equalTo]查询api
   * equalTo("isLike", "==", 100);
   * 一维数组也支持 ["title", "!=", "bmob sdk"] , 必须是3个值
   * 二维数组
   * [ ["isLike", "==", 100], ["title", "!=", "bmob sdk"] ]
   *
   * equalTo 方法支持 "==","!=",">",">=","<","<="
   * http://doc.bmob.cn/data/wechat_app_new/index.html#_26
   * */
  ops: Array,

  /**
   * 对应[containedIn]查询api
   * 查询指定列, 包含指定的值. 列的数据类型支持数组`Array`
   *
   * containedIn("playerName", ["Bmob", "Codenow", "JS"]);
   * http://doc.bmob.cn/data/wechat_app_new/index.html#_29
   * */
  contains: Array,

  /**排序
   * -updatedAt : 对updatedAt字段降序排列, 最近添加的在第一个位置
   * ["-score","name"] :多个字段进行排序
   * http://doc.bmob.cn/data/wechat_app_new/index.html#_31
   * */
  order: Array | Object,

  /**回调函数, 参数是`Bmob.Query`对象*/
  queryConfig: Function,

  /**查询错误的提示, 出现错误时, 优先使用的错误信息*/
  error: String,
}

/**仅设置`equalTo`相关的查询配置*/
RQuery.configQuery = function (query, ops) {
  let queryObj = {}
  if (query) {
    if (ops instanceof Array && ops.length > 0) {
      if (ops[0] instanceof Array) {
        //二维数组
        ops.forEach(item => {
          if (item.length >= 3) {
            Object.assign(queryObj, query.equalTo(item[0], item[1], item[2]))
          }
        })
      } else {
        //一维数组
        if (ops.length >= 3) {
          Object.assign(queryObj, query.equalTo(ops[0], ops[1], ops[2]))
        }
      }
    }
  }
  //console.log(queryObj)
  return queryObj
}

/**
 * @param query [Bmob.Query]对象
 * */
RQuery.config = function (query) {
  let rQuery = this

  //查询条件 equalTo
  let ops = rQuery.ops
  RQuery.configQuery(query, ops)

  //查询条件 containedIn
  let contains = rQuery.contains
  if (contains instanceof Array && contains.length > 0) {
    if (contains[0] instanceof Array) {
      //二维数组
      contains.forEach(item => {
        if (item.length >= 2) {
          if (item[1] instanceof Array) {
            query.containedIn(item[0], item[1])
          } else {
            //如果不是 Array类型, 则封装成Array
            query.containedIn(item[0], [item[1]])
          }
        }
      })
    } else {
      //一维数组
      if (contains.length >= 2) {
        if (contains[1] instanceof Array) {
          query.containedIn(contains[0], contains[1])
        } else {
          //如果不是 Array类型, 则封装成Array
          query.containedIn(contains[0], [contains[1]])
        }
      }
    }
  }

  //排序
  if (this.order) {
    if (this.order instanceof Array) {
      query.order(...this.order)
    } else {
      query.order(this.order)
    }
  }

  if (rQuery.queryConfig instanceof Function) {
    rQuery.queryConfig(query)
  }
}

export default RQuery

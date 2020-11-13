/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2020/10/13
 * 页面请求相应的参数
 */

const Page = {
  /**请求时:每页请求数量大小*/
  pageSize: 10,
  /**请求时:当前请求的第几页*/
  requestPage: 1,
  /**返回时:数据总数(如果有)*/
  dataCount: 0
}

/**
 * @param query [Bmob.Query]对象
 * */
Page.config = function (query) {
  let page = Math.max(1, this.requestPage || Page.requestPage)
  let size = Number(this.pageSize || Page.pageSize)
  let skip = (page - 1) * size
  query.skip(skip)
  query.limit(size)
}

export default {...Page}

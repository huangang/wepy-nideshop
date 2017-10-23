/**
 * 支付相关服务
 */

import util from '../utils/util.js'
import api from '../config/api.js'
import wepy from 'wepy'

/**
 * 判断用户是否登录
 */
async function payOrder(orderId) {
  let res = await util.request(api.PayPrepayId, {
    orderId: orderId
  })
  console.log(res)
  if (res.errno === 0) {
    const payParam = res.data
    try {
      let ret = await wepy.requestPayment({
        'timeStamp': payParam.timeStamp,
        'nonceStr': payParam.nonceStr,
        'package': payParam.package,
        'signType': payParam.signType,
        'paySign': payParam.paySign
      })
      return !!ret
    } catch (e) {
      return false
    }
  } else {
    return false
  }
}

module.exports = {
  payOrder
}

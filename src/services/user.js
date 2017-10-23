/**
 * 用户相关服务
 */

import util from '../utils/util.js'
import api from '../config/api.js'
import wepy from 'wepy'
/**
 * 调用微信登录
 */
async function loginByWeixin() {
  let code = null
  let res = await util.login()
  if (res) {
    code = res.code
    let userInfo = await util.getUserInfo()
    if (userInfo) {
      let ret = await util.request(api.AuthLoginByWeixin, {code: code, userInfo: userInfo}, 'POST')
      if (ret.errno === 0) {
        // 存储用户信息
        wepy.setStorageSync('userInfo', ret.data.userInfo)
        wepy.setStorageSync('token', ret.data.token)
      }
      return ret
    }
  }
  return false
}

/**
 * 判断用户是否登录
 */
async function checkLogin() {
  if (wepy.getStorageSync('userInfo') && wepy.getStorageSync('token')) {
    let res = await util.checkSession()
    if (res) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

module.exports = {
  loginByWeixin,
  checkLogin
}

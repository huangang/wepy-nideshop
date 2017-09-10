import api from '../config/api.js'
import wepy from 'wepy'

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 封封微信的的request
 */
async function request(url, data = {}, method = 'GET') {
  let res = await wepy.request({
    url: url,
    data: data,
    method: method,
    header: {
      'Content-Type': 'application/json',
      'X-Nideshop-Token': wepy.getStorageSync('token')
    }
  })
  if (res.statusCode === 200) {
    if (res.data.errno === 401) {
      // 需要登录后才可以操作
      let code = null
      let resu = await login()
      if (resu) {
        code = resu.code
        let userInfo = await getUserInfo()
        if (userInfo) {
          let ret = await request(api.AuthLoginByWeixin, { code: code, userInfo: userInfo }, 'POST')
          if (ret && ret.errno === 0) {
            wepy.setStorageSync('userInfo', res.data.userInfo)
            wepy.setStorageSync('token', res.data.token)
            return true
          }
        }
      } else {
        return false
      }
    } else {
      return res.data
    }
  } else {
    console.log(res.errMsg)
    return false
  }
}

/**
 * 检查微信会话是否过期
 */
async function checkSession() {
  try {
    return await wepy.checkSession()
  } catch (e) {
    return false
  }
}

/**
 * 调用微信登录
 */
async function login() {
  let res = await wepy.login()
  return !res.code ? false : res
}

async function getUserInfo() {
  try {
    return await wepy.getUserInfo({withCredentials: true})
  } catch (e) {
    return false
  }
}

function redirect(url) {
  // 判断页面是否需要登录
  if (!url) {
    wepy.redirectTo({
      url
    })
  } else {
    wepy.redirectTo({
      url: '/pages/auth/login'
    })
    return false
  }
}

function showErrorToast(msg) {
  wepy.showToast({
    title: msg,
    image: '/static/images/icon_error.png'
  })
}

module.exports = {
  formatTime,
  request,
  redirect,
  showErrorToast,
  checkSession,
  login,
  getUserInfo
}

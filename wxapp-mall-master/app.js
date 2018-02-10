App({
  onLaunch: function () {
    console.log('App Launch')

    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.authorize({
            scope: 'scope.userInfo',
          })
        }
      }
    })
  },
  onShow: function () {
    console.log('App Show')
    wx.checkSession({
      success: function () {
        //session 未过期，并且在本生命周期一直有效
        console.log('wx session 未过期')

        let bzTokenKey = getApp().globalData.bzTokenKey;

        let token = wx.getStorageSync(bzTokenKey);
        if(!token){
            getApp().login()
        }
      },
      fail: function () {
        console.log('wx session 过期')
        getApp().login()
      }
    }
    )
  },
  onHide: function () {
    console.log('App Hide')
  },
  globalData: {
    appName: '办公袋',
    baseImgUrl: 'http://baize-webresource.oss-cn-shenzhen.aliyuncs.com/',  
    //baseImgUrl: 'http://dev-baize-webresource.oss-cn-shenzhen.aliyuncs.com/',
    hasLogin: false,
    loginLock : false,
    phoneNumKf : '020-87917217',
    //svr: 'https://192.168.0.115:8081/mall/wxapp/',
    //svr: 'https://192.168.0.115:8443/mall/wxapp/',
    //svr: 'https://192.168.0.114:8081/mall/wxapp/',
    // svr: 'https://192.168.0.100:443/wxapp/lxh/',
    // svr: 'https://mall.baizeai.com/wxapp/lxh/',
    // svr: 'https://mall.baizeai.com/wxapp/lgr/',
    svr: 'https://mall.baizeai.com/wxapp/',
    bzTokenKey: 'bz-token',
    needRegPhoneNumKey: 'needRegPhoneNumKey',
    searchResult: [],
  },
  login: function (cb) {

    let cbFn = cb || function(){};

    if(getApp().globalData.loginLock){
        return;
    } 
    getApp().globalData.loginLock = true;

    try{
        console.log('进行登录')
        const server = getApp().globalData.svr
        const bzTokenKey = getApp().globalData.bzTokenKey
        const needRegPhoneNumKey = getApp().globalData.needRegPhoneNumKey
        wx.login({
            success: function (res) {
                if (res.code) {
                    //发起网络请求
                    console.log('登录\n请求token.wx-code:' + res.code)
                    wx.request({
                        url: server + 'login',
                        data: {
                            code: res.code
                        },
                        success: function (res2) {
                            if (res2.data.meta.code == 200) {
                                let token = res2.data.data.token
                                let needRegPhoneNum = !res2.data.data.regPhoneNum
                                console.log("登录成功\ntoken: " + token + '\n是否需要注册电话号码:' + needRegPhoneNum)
                                // 保存token
                                wx.setStorageSync(bzTokenKey, token)
                                wx.setStorageSync(needRegPhoneNumKey, needRegPhoneNum);
                                cbFn(res2);
                            } else {
                                console.log('登录失败')
                            }
                        },
                        complete : function(){
                            getApp().globalData.loginLock = false;
                        }
                    })
                } else {
                    console.log('获取用户登录态失败！\n' + res.errMsg)
                    getApp().globalData.loginLock = false;
                }
            },
            fail : function(){
                getApp().globalData.loginLock = false;
            }
        }) //重新登录
    }
    catch(e){
        getApp().globalData.loginLock = false;
    }
    
  },
  /**
   * 针对wxrequest的一个wrap,会主动将通过login获取的bz服务器的session存进请求中,同时当session过期时进行更新
   * USAGE:
   * getApp().bzRequest({url:'http://127.0.0.2:8080/',data:{'d1':1},complete:function(res){console.log(123)}})
   */
  bzRequest: function (OBJECT) {
    const bzTokenKey = getApp().globalData.bzTokenKey
    const bzToken = wx.getStorageSync(bzTokenKey)
    console.log('发送请求-->' + OBJECT.url + '\ntoken:' + bzToken)
    let withoutToken =  true;

    //请求失败不弹窗提示
    OBJECT.noErrorLog = true;

    if ( typeof OBJECT.withoutToken == 'boolean' && !OBJECT.withoutToken ){
        withoutToken = false;
    }

    let h = OBJECT['header'] || {};

    function loadfail(msg){
        let mesg = msg || '请求失败';
        wx.showModal({
            content: mesg,
            showCancel : false
        })
    }

    function wxRq(){

        let showLoading = OBJECT.showLoading,
            defualtErr = {
                data: {
                    meta: {
                        code: 500,
                        msg: '发送请求失败'
                    }
                }
            };

        if (showLoading)
            wx.showLoading({ mask: true });

        wx.request({
            url: OBJECT.url,
            data: OBJECT.data,
            header: h,
            method: OBJECT.method,
            dataType: OBJECT.dataType,
            responseType: OBJECT.responseType,
            success: function (res) {

                if (!showLoading)//这里这么做的缘故是因为wx的bug:hideLoading会关掉toast
                    wx.hideLoading();
              
                if (res.data.meta && res.data.meta.code == 200){
                    if ( typeof OBJECT.success == 'function')
                        OBJECT.success(res);
                }  
                else if (res.data.meta && res.data.meta.code != 401){

                    if ( typeof OBJECT.errorcb == 'function'){
                        let err = res.data.meta ? res : defualtErr;
                        OBJECT.errorcb(res);
                    }
                    else{

                        if (OBJECT.noErrorLog) {
                            return;
                        }

                        if (res.data.meta) {
                            loadfail(res.data.meta.msg);
                        }
                        else {
                            loadfail('发送请求失败');
                        }

                    }
                }                
                
            },
            fail: function () {

                if (!showLoading)
                    wx.hideLoading();
                if (OBJECT.fail != null)
                    OBJECT.fail();

                if (typeof OBJECT.errorcb == 'function') {
                    OBJECT.errorcb(defualtErr);
                }
                else{

                    if (OBJECT.noErrorLog) {
                        return;
                    }

                    loadfail('发送请求失败');
                }
                
            },
            complete: function (res) {
            
                console.log(OBJECT.url + '\n返回-->')
                console.log(res)
                if (OBJECT.complete != null)
                    OBJECT.complete(res)
                //token过期则更新token
                //这里默认服务器的token过期通过返回值来中带有token字段来表示
                
                if (res.statusCode == 401) {
                    let token = res.header.Authorization;
                            
                    if (token){
                        console.log('旧token过期,更新token为\n' + token)
                        wx.setStorageSync(bzTokenKey, token)
                        getApp().bzRequest(OBJECT)//重新请求
                    }
                    else{
                        getApp().login();
                    }
                }
                
            },
        })
    }

    if (withoutToken){
        wxRq();
        return;
    }

    if (bzToken && bzToken.trim() != '') {//判断是否需要登录

        h['Authorization'] = bzToken;

        wxRq();
    }
    else {
      console.log('token为空,重新登录')
      getApp().login()//假设由于如清缓存等原因导致存储的token消失了,再登一遍
    }
  }
})

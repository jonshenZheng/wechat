let app = getApp();
/*首页banner跳转*/
function resolveCtrlProtoUri(uri) {
    
  console.log(uri);
  let idx = uri.search('://');
  let proto = uri.substring(0, idx);
  let body = uri.substring(idx + 3, uri.length);
  if(proto == 'wx-switchtab'){
    wx.switchTab({
      url: body,
    })
  } else if (proto == 'wx-webview'){
    if (wx.canIUse('web-view')){
      wx.navigateTo({
        url: '../webview/webview?url='+body,
      });
    }
  } else if (proto == 'wx-redirect') {
    wx.redirectTo({
      url: body,
    });
  } else if (proto == 'wx-navigate') {
    wx.navigateTo({
      url: body,
    });
  }
}

/*检查是否绑定手机*/
function isRegister(backUrl,backWay,canBack = false){

    let backToUrl = backUrl || '../index/index';
    
    /*判断是否注册*/
    var needRegPhoneNumKey = true;//wx.getStorageSync('needRegPhoneNumKey');
    
    if (needRegPhoneNumKey){
        if (canBack){
            wx.navigateTo({
                url: '../register/register?backUrl=' + backToUrl + '&backWay=' + backWay
            })
        }
        else{
            wx.redirectTo({
                url: '../register/register?backUrl=' + backToUrl + '&backWay=' + backWay
            })
        }
        
        return;
    }

}

/*拨打客服电话*/
function callKefu(){
    let pNumber = app.globalData.phoneNumKf;
    wx.showModal({
        content: '是否要拨打客服电话\n' + pNumber,
        success : function(r){
            if(r.confirm){
                wx.makePhoneCall({
                    phoneNumber: pNumber,
                })
            }
        }
    })

}


module.exports = {
    isRegister : isRegister,
    resolveCtrlProtoUri: resolveCtrlProtoUri,
    callKefu: callKefu
}

module.exports.resolveCtrlProtoUri = resolveCtrlProtoUri
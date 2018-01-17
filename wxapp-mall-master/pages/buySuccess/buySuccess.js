// page/component/buySuccess/buySuccess.js
Page({

    data: {
        phoneNum: getApp().globalData.phoneNumKf
    },
    connectUs : function(){
        wx.makePhoneCall({
            phoneNumber: this.data.phoneNum,
        })
    }
  
})
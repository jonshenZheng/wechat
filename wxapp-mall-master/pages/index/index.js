var common = require('../common/common.js')
let app = getApp(),
  rq = app.bzRequest,
  baseURL = app.globalData.svr,
  imgBaseURL = app.globalData.baseImgUrl;
// wx.navigateTo({
//   url: 'page/component/register/register',
// })
Page({
  data: {
    promotions: [
    ],
    indicatorDots: false,
    imgBaseURL: imgBaseURL,
    recommend : [],
    autoplay: false,
    interval: 3000,
    duration: 800,
    hotSearches: [{ 'keyword': '1111' }, { 'keyword': '222' }, { 'keyword': '333' }],
  },
  onShow: function (e) {
    let that = this;
    if (that.data.promotions.length == 0)

    rq({
        url: baseURL + 'ad',
        success: function (res) {

            let promotions = res.data.data;
            for (var i = 0; i < promotions.length; i++)
            {
              let promo = promotions[i];
              promo.imgUrl = imgBaseURL+ promo.imgUrl;
            }
            // console.log(promotions);
            that.setData({
              promotions: promotions}
            );
          
        }
      });

    rq({
          url: baseURL +'recommend/getRecommend',
          success : function(r){
              
              if (r.data.meta && r.data.meta.code == 200){
                  that.setData({
                      recommend: r.data.data.recommends
                  })
                }
          }
      })  

  },
  onTapCtrlProtoUri:function(e){
      
    common.resolveCtrlProtoUri(e.currentTarget.dataset.uri);
    // common.resolveCtrlProtoUri("wx-navigate://../package/package?id=group1");
  },
  onSearchKeywordInput: function (e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },
  onTapSearchButton: function () {
    var keyword = this.data.searchKeyword;
    if (keyword != null) {
      this.search(keyword);
    }
  },
  search: function (keyword) {
    keyword = keyword.trim()
    if (keyword != '') {
      console.log("search: " + keyword)
      app.bzRequest({
        url: app.globalData.svr + 'toListProduces',
        data: { 'prodName': keyword },
        header: { 'content-type': 'application/json' },
        method: 'POST',
        success: function (res) {
          // console.log(res)
        }
      })
    }
  },
  intocateg: function () {
    wx.switchTab({
      url: '../category/category'
    })
  },
  onTapHotSearchKeyword: function (e) {
    console.log(e.currentTarget.dataset.search);
    let search = e.currentTarget.dataset.search;
    // if(search)
    //   {
    //     this.
    //   }
  },
  onTapSearchImageButton: function (e) {
    let that = this;
    wx.chooseImage({
      success: function (res) {
          
        var tempFilePaths = res.tempFilePaths  //图片  
        console.log(tempFilePaths);
        setTimeout(function(){
            wx.showLoading();

            wx.uploadFile({
                url: baseURL + 'imageSearch', //仅为示例，非真实的接口地址  
                filePath: tempFilePaths[0],
                name: 'image', //文件对应的参数名字(key)  
                formData: {
                    'pageSize': 15
                },
                success: function (res) {

                    let data = JSON.parse(res.data);
                    if (data.meta.code == 200) {
                        console.log(data);
                        app.globalData.searchResult = data.data;
                        wx.navigateTo({
                            url: '../search/search',
                        })
                    } else {
                        wx.showModal({
                            title: '错误',
                            content: data.meta.msg,
                        })
                    }
                    console.log('success')
                },
                fail: function () {
                    wx.showModal({
                        title: '错误',
                        content: data.meta.msg,
                    })
                },
                complete: function (res) {
                    wx.hideLoading();
                    console.log('complete')
                }
            })
        },100);
        
      }
    })
  }
})
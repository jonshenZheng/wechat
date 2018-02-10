var common = require('../common/common.js')
let app = getApp(),
  rq = app.bzRequest,
  baseURL = app.globalData.svr,
  storageKey = 'index',
  imgBaseURL = app.globalData.baseImgUrl;
// wx.navigateTo({
//   url: 'page/component/register/register',
// })
Page({
  data: {
    promotions: [
    ],
    btnff : '',
    indicatorDots: false,
    imgBaseURL: imgBaseURL,
    recommend : [],
    autoplay: false,
    interval: 3000,
    duration: 800,
    hotSearches: [{ 'keyword': '1111' }, { 'keyword': '222' }, { 'keyword': '333' }],
  },
  onimgfail: function (e) {
    
      let objName = e.currentTarget.dataset.objname,
          arr,
          key,
          self = this;

        switch (objName){
            case 'recommend': arr = this.data.recommend;
                              key = 'pic';  
                break;
            case 'promotions': arr = this.data.promotions;
                               key = 'imgUrl';
                break;
        }

        common.loadimgfail(arr, e, objName, key, self);
  },
  onLoad : function(e){

    //获取 推荐产品 本地缓存
    /*let RecommendStorage = wx.getStorageSync(recommendName);

    if (!RecommendStorage){
        RecommendStorage = {}
        RecommendStorage['version'] = '';
        RecommendStorage['recommend'] = [];
    }

    this.setData({
        recommend: RecommendStorage.recommend
    });*/
    let pageStorage = common.getSorageByPage(storageKey, this);  

    //设置导航栏标题文字
    wx.setNavigationBarTitle({
        title : app.globalData.appName
    });

      let that = this;
      if (that.data.promotions.length == 0)

          rq({
              url: baseURL + 'ad',
              success: function (res) {

                  let promotions = res.data.data;
                  common.checkImgExist(promotions, 'imgUrl');

                  common.setStorageByPage(storageKey, that ,'promotions', pageStorage , promotions);
                                                 
                //   that.setData({
                //       promotions: promotions
                //   });
              }
          });

      rq({
          url: baseURL + 'recommend/getRecommend',
          success: function (r) {
            
              if (r.data.meta && r.data.meta.code == 200) {

                common.checkImgExist(r.data.data.recommends, 'pic');

                common.setStorageByPage(storageKey, that, 'recommend', pageStorage, r.data.data.recommends);

              }
          }
      })  
  },
  btnStartFn : function(e){
      let n = e.currentTarget.dataset.cname;
      common.btnStartFn(this,n);
  },
  btnEndFn: function () {
      common.btnEndFn(this);
  },
  onShow: function (e) {

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
    //1 打开界面让用户选择图片
    wx.chooseImage({
      success: function (res) {
        //用户选择了图片  
        var tempFilePaths = res.tempFilePaths  //图片  
        console.log(tempFilePaths);
        //这里因为chooseImage会默认关闭loading,所以需要延迟执行上传图片
        setTimeout(function(){
            wx.showLoading();
            //2 上传图片获得相应id(因为wx.uploadFile接口对响应时间的限定,只能先获得id再请求)
            wx.uploadFile({
              url: baseURL + 'imageSearch/upload', //仅为示例，非真实的接口地址  
                filePath: tempFilePaths[0],
                name: 'image', //文件对应的参数名字(key)  
                success: function (res) {
                    console.log(res)
                    let data = JSON.parse(res.data);
                    if (data.meta.code == 200) {
                        let imgId = data.data;
                        //3 根据id请求搜索结果
                        rq({
                          url: baseURL + 'imageSearch/' + imgId,
                          data:{
                            'pageSize': 15
                          },
                          success: function (res2) {
                            app.globalData.searchResult = res2.data.data;
                            wx.navigateTo({
                              url: '../search/search',
                            })
                          },
                          complete:function(){
                            wx.hideLoading();
                          }
                        });
                    } else {
                      wx.hideLoading();
                        wx.showModal({
                            title: '错误',
                            content: data.meta.msg,
                        })
                    }
                },
                fail: function (data) {
                  wx.hideLoading();
                    wx.showModal({
                        title: '错误',
                        content: data.meta.msg,
                    })
                }
            })
        },100);
        
      },
      complete : function(){
          common.btnEndFn(that);
      }
    })
  }
})
//获取应用实例
let app = getApp(),
  rq = app.bzRequest,
  baseURL = app.globalData.svr,
  commJS = require("../common/common.js"),
  prodID;

Page({
  data: {
    sendkefu: {},
    baseimgURL: app.globalData.baseImgUrl,
    btnff : '',
    sendkefuMsg : '',
    cartNumAnimate : '',
    addcartNum : '',
    totalCartNum: 0,    
    tabarData: {
      isCollection: false,
      isAddCart: false
    },
    isShowPop : false,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsSelection: {
    },//核心:选择所依托的数据
    goodsDetail: {
    },//核心:当前选中的商品的详情
    collectionId : '',
    swiperCurrent: 0,//目前没用
    hasMoreSelect: true,//是否能针对当前商品进行更多的属性选择
    bHideSelectView: true,//是否显示选择的view
    purchaseQuantity: 1,//用户设置的购买数量,每点一次加入购车,就会放入bHideSelectView个商品
    minPurchaseQuantity: 1,
    maxPurchaseQuantity: 999,
    selectedPropertyStr: "",//选中的属性对应的字符串,用于界面显示选择中属性文本
  },

  onLoad: function (e) {

    wx.showLoading({
      title: '加载中',
    })

    let self = this,
      dataO;

    prodID = e.prodId;
    var skuId = e.skuId;
    var url = baseURL + 'produce/detail/' + prodID;
    if (skuId)
      url = baseURL + 'produce/skudetail/' + prodID + '/' + skuId;
    rq({
      url: url,
      header: { "with-selection": "true" },
      success: function (r) {
        wx.hideLoading();

        let selection = r.data.data.goodsSelection;
        let selected = r.data.data.goodsSelection.selected;
        
        for (var i = 0; i < selected.properties.length; i++) {
          let idx = selected.properties[i];
          try {
            selection.properties[i].values[idx].selected = true
          } catch (e) {
            console.error(e)
          }
        }

        if (!r.data.data.goodsDetail.pics.length){
            r.data.data.goodsDetail.pics[0] = '';
        }

        commJS.checkImgExist(r.data.data.goodsDetail.pics);
        r.data.data.goodsDetail.basicInfo.icon = commJS.checkImgExist(r.data.data.goodsDetail.basicInfo.icon);

        self.setData({
          goodsSelection: r.data.data.goodsSelection,
          goodsDetail: r.data.data.goodsDetail
        });
        self.checkSelection();

      }
    });

    //请求是否收藏
    rq({
      url: baseURL + 'colletion/getId/' + prodID,
      withoutToken: false,
      success: function (r) {

        self.setData({
          collectionId: r.data.data.mallCollectionId
        });

      }
    });

    let sendKefuObj = {
      prodId: prodID,
      skuId: skuId
    };

    this.changeProdFn(sendKefuObj);

  },
  onShow: function (e) {
    // 主动刷新购物车数量
    this.getCartNUM();
  },
  showCartNum : function(num){
    let self = this;
    this.setData({
        cartNumAnimate : 'on',
        addcartNum: num
    });
    setTimeout(function(){
        self.setData({
            cartNumAnimate: '',
            addcartNum: ''
        });
    },1000)
  },
  btnStartFn: function (e) {
      let n = e.currentTarget.dataset.cname,
          common = common ? common : commJS; 

      common.btnStartFn(this, n);
  },
  btnEndFn: function () {
      let common = common ? common : commJS; 
      common.btnEndFn(this);
  },
  onimgfail: function (e) {

      let objName = e.currentTarget.dataset.objname,
          ind = e.currentTarget.dataset.imgind,
          arr = this.data.goodsDetail;

      switch (objName) {
          case 'pics':  if (e.detail.errMsg.indexOf('noPic.png') === -1) {
                            arr.pics[ind] = '../../image/noPic.png';
                        }
              break;
          case 'icon':  if (e.detail.errMsg.indexOf('noPic.png') === -1) {
                            arr.basicInfo.icon = '../../image/noPic.png';
                        }
              break;
      }

      this.setData({
          goodsDetail: arr
      });

  },

  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  changeProdFn : function(data,cb){

      let dataObj,
          pid = data.prodId ? data.prodId : this.data.sendkefu.prodId,
          sid = data.skuId ? data.skuId : this.data.sendkefu.skuId;

        dataObj = {
            prodId: pid,
            skuId: sid
        }

        this.setData({
            sendkefu: dataObj
        });
  },
  getCartNUM : function(cb){
      let cbFn = cb || '',
          self = this;
      rq({
          url: baseURL + 'shopcart/count',
          withoutToken: false,
          success: function (r) {
              self.setData({
                  totalCartNum: r.data.data
              });
              if (typeof cbFn == 'function'){
                  cbFn();
              }
          }
      });
  },
  /**
   * 跳转到购物车页面
   */
  goToShopCart: function () {
    // wx.switchTab({
    //   url: '../cart/cart'
    // })
      wx.navigateTo({
          url: '../cart2/cart2'
      })
  },
  /**
   * 添加到购物车
   */
  addToShopCart: function () {

    let that = this;
    let res = this.checkSelection();
    let canSubmit = res.skuId;
    if (canSubmit) {
      rq({
        method: 'post',
        withoutToken: false,
        url: baseURL + 'shopcart/' + prodID + '/' + this.data.goodsDetail.basicInfo.id + '/' + this.data.purchaseQuantity,
        success: function (r) {

            wx.showToast({
              title: r.data.meta.msg,
              icon: 'success',
              duration: 1500
            });
            that.hideSelectView();
            
            that.getCartNUM(function(){
                 that.showCartNum(r.data.data);
            });

        }
      })
    } else {
      if (this.data.bHideSelectView)
        this.popupSelectView();
      else
        wx.showModal({
          title: '提示',
          content: '请选择商品规格',
          showCancel: false,
        })
    }
  },

  addToCollection: function () {

    let that = this;
    let collectionId = this.data.collectionId;
    let isInCollection = Boolean(collectionId);

    let url = baseURL + 'collection/';
    let method = 'post';
    let toastTitle = '收藏成功';
    if (isInCollection){
      url += collectionId;
      method = 'delete';
      toastTitle = '取消收藏';
    }else{
      url += prodID;
    }
    rq({
      url: url,
      withoutToken: false,
      method: method,
      
      success: function success(res) {
        if (res.statusCode != 200)
          return;
        if (res.data.meta.code == 200) {
          if (isInCollection)
            collectionId = '';
          else
            collectionId = res.data.data;
        }else{
          toastTitle = res.data.meta.msg;
        }
        console.log(toastTitle + collectionId);
        that.setData({
          collectionId: collectionId
        })
        wx.showToast({
          title: toastTitle,
        });
      }
    });    
  },

  /**
   * 规格选择弹出框
   */
  popupSelectView: function () {
    this.setData({
      isShowPop : true,  
      bHideSelectView: false
    })
  },

  /**
   * 规格选择弹出框隐藏
   */
  hideSelectView: function () {
    this.setData({
      isShowPop : false,  
      bHideSelectView: true
    })
  },
  
  /**
   * 增加购买数目
   */
  onTapIncrOrDecrQuantityBtn: function (e) {
    let incr = e.currentTarget.dataset.increasement
    var currentQuantity = this.data.purchaseQuantity;
    this.changeQuantity(currentQuantity + Number(incr));
  },
  onInputQuantity: function (e) {

    let val = Number(e.detail.value);
    this.changeQuantity(val);
  },
  changeQuantity: function (val) {
    let min = this.data.minPurchaseQuantity,
      max = this.data.maxPurchaseQuantity;

    if (val < min) {
      val = min;
    }
    else if (val > max) {
      val = max;
    }

    this.setData({
      purchaseQuantity: val
    })

  },

  /**
   * 选择商品规格
   * @param {Object} e
   */
  selectGoods: function (e) {
    var that = this;
    var properties = that.data.goodsSelection.properties;
    const propertyIndex = e.currentTarget.dataset.propertyIndex;
    const propertyValueIndex = e.currentTarget.dataset.propertyValueIndex;
    const propertyDisabled = e.currentTarget.dataset.propertyDisabled;

    //首先属性应该是可选的,不可选则直接返回
    if (propertyDisabled) {
      console.log('propertyDisabled');
      return;
    }

    // 取消该属性下的所有值的选中状态+设置当前选中状态
    let prevStatus = properties[propertyIndex].values[propertyValueIndex].selected
    var childs = properties[propertyIndex].values;
    for (var i = 0; i < childs.length; i++) {
      properties[propertyIndex].values[i].selected = false;
    }
    properties[propertyIndex].values[propertyValueIndex].selected = !prevStatus;

    // 检查当下的选择
    var checkRes = this.checkSelection();
    let selectedPropertyStr = checkRes.selectedPropertyStr;
    let selectedPropertyIndexs = checkRes.selectedPropertyIndexs;

    // 重新计算disable
    let compositions = this.data.goodsSelection.composition;
    //当第i个属性未确定,其余均取当前选择的结果,那么看第i个属性所有的值有哪些是存在于组合的
    for (var i = 0; i < selectedPropertyIndexs.length; i++) {      
      let tmpCompProp = selectedPropertyIndexs.slice(0);
      // 将未选中项替换为对应的正则\\d+
      for (var j = 0; j < tmpCompProp.length; j++){
        if (j != i && tmpCompProp[j] == -1)
          tmpCompProp[j] = '\\d+';
      }
      // 遍历第i个属性的所有取值
      let propValue = properties[i].values;
      for (var j = 0; j < propValue .length; j++) {
        tmpCompProp[i] = j;//第i个属性取第j个值
        var exp = new RegExp('^' + tmpCompProp.toString() + "$");//生成对应的正则
        let disabled = true;
        for (var k = 0; k < compositions.length; k++) {
          let compProp = compositions[k].properties;
          let meet = exp.test(compProp.toString());//判断
          if (meet) {
            disabled = false;
            break;
          }
        };
        propValue[j].disabled = disabled;
      }
    }

    let kefuMsg = '产品名：' + this.data.goodsDetail.basicInfo.name + '规格：' + selectedPropertyStr;

    // 更新选择
    that.setData({
      goodsSelection: that.data.goodsSelection,
      selectedPropertyStr: selectedPropertyStr,
      sendkefuMsg: kefuMsg
    });

    // 更新商品详情
    var skuId = checkRes.skuId;
    if (skuId) {
      var url = baseURL + 'produce/skudetail/' + prodID + '/' + skuId;

      wx.showLoading()
      rq({
        url: url,
        header: { "with-selection": "false" },
        success: function (r) {
            if (!r.data.data.goodsDetail.pics.length) {
                r.data.data.goodsDetail.pics[0] = '';
            }
            commJS.checkImgExist(r.data.data.goodsDetail.pics);
            r.data.data.goodsDetail.basicInfo.icon = commJS.checkImgExist(r.data.data.goodsDetail.basicInfo.icon);
            that.setData({
              goodsDetail: r.data.data.goodsDetail,
            });
        },
        complete: function () {
            wx.hideLoading();
        }
      })

      that.changeProdFn({ skuId: skuId});

    }
  },

  /**
   * 检查当前的选择是否合法
   * 注意!!!这个方法会更新selectedPropertyStr
   * 返回skuid,空串则非法
   */
  checkSelection: function () {
    // 获取所有的选中规格尺寸数据
    var properties = this.data.goodsSelection.properties
    var needSelectNum = properties.length;
    var curSelectNum = 0;
    var selectedPropertyIndexs = [];
    var selectedPropertyStr = "";
    for (var i = 0; i < properties.length; i++) {
      var childs = properties[i].values;
      var s = false;
      for (var j = 0; j < childs.length; j++) {
        if (childs[j].selected) {
          curSelectNum++;
          s = true;
          selectedPropertyIndexs.push(j);
          // selectedPropertyStr = selectedPropertyStr + properties[i].name + ":" + childs[j].name + "  ";
          selectedPropertyStr = selectedPropertyStr + childs[j].name + "，";
        }
      }
      if (!s)
        selectedPropertyIndexs.push(-1);
    }
    if (selectedPropertyStr.endsWith("，"))
      selectedPropertyStr = selectedPropertyStr.substr(0, selectedPropertyStr.length-1)

    var skuId = '';
    if (needSelectNum == curSelectNum) {
      let comp = this.data.goodsSelection.composition;
      for (var i = 0; i < comp.length; i++) {
        let value = comp[i];
        if (value.properties.toString() == selectedPropertyIndexs.toString()) {
          skuId = value.id;
          break;
        }
      };
    }

    let kefuMsg = '产品名：' + this.data.goodsDetail.basicInfo.name + '规格：' + selectedPropertyStr;

    this.setData({
      selectedPropertyStr: selectedPropertyStr,
      sendkefuMsg: kefuMsg
    });

    return {
      "skuId": skuId,
      "selectedPropertyIndexs": selectedPropertyIndexs,
      "selectedPropertyStr": selectedPropertyStr,
    };
  },

  contactUs: function () {
      commJS.callKefu()
  },

  onShareAppMessage: function () {
    return {
      title: this.data.goodsDetail.basicInfo.name,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.basicInfo.id + '&inviter_id=' + app.globalData.uid,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  /*图片预览*/
  prevImg : function(e){
      var src = e.currentTarget.dataset.src;
      wx.previewImage({
          current: src, 
          urls: this.data.goodsDetail.pics 
      });
  },
  getVideoSrc: function (videoId) {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/media/video/detail',
      data: {
        videoId: videoId
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            videoMp4Src: res.data.data.fdMp4
          });
        }
      }
    })
  }
})


//获取应用实例
let app = getApp(),
  rq = app.bzRequest,
  baseURL = app.globalData.svr,
  commJS = require("../common/common.js"),
  prodID;

Page({
  data: {
    baseimgURL: app.globalData.baseImgUrl,
    tabarData: {
      isCollection: false,
      isAddCart: false
    },
    isShowPop : false,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsSelection: {
    },
    goodsDetail: {
    },
    collectionId : '',
    swiperCurrent: 0,
    hasMoreSelect: true,
    bHideSelectView: true,
    purchaseQuantity: 1,
    minPurchaseQuantity: 1,
    maxPurchaseQuantity: 999,
    propertyValueNames: "",
  },

  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
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
        selection.properties[i].values[selected.properties[i]].selected = true
        }
        self.setData({
        goodsSelection: r.data.data.goodsSelection,
        goodsDetail: r.data.data.goodsDetail,
        //collectionId: r.data.data.mallCollectionId,
        maxPurchaseQuantity: r.data.data.goodsSelection.selected.count
        });
        self.checkSelection();

      }
    });

    //请求是否收藏
    rq({
        url: baseURL + 'colletion/getId/' + prodID,
        withoutToken: false,
        success : function(r){

            self.setData({
                collectionId: r.data.data.mallCollectionId
            });
            
        }
    })



  },
  limitNum : function(e){

      let val = Number(e.detail.value),
          min = this.data.minPurchaseQuantity,
          max = this.data.maxPurchaseQuantity; 

      if (val < min){
          val = min;
      }
      else if (val > max){
          val = max;
      }

      this.setData({
          purchaseQuantity: val
      })

  },
  goShopCar: function () {
    wx.switchTab({
      url: '../cart/cart'
    })
  },

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

  descQuantity: function () {
    if (this.data.purchaseQuantity > this.data.minPurchaseQuantity) {
      var currentNum = this.data.purchaseQuantity;
      currentNum--;
      this.setData({
        purchaseQuantity: currentNum
      })
    }
  },

  incrQuantity: function () {
      
    if (this.data.purchaseQuantity < this.data.maxPurchaseQuantity) {
      var currentNum = this.data.purchaseQuantity;
      var maxNum = this.data.maxPurchaseQuantity; 

      currentNum++;
      this.setData({
        purchaseQuantity: currentNum
      })
    }
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
    let propertyValueNames = checkRes.propertyValueNames;
    let propertyValueIndexs = checkRes.propertyValueIndexs;

    // 重新计算disable
    let compositions = this.data.goodsSelection.composition;
    //当第i个属性未确定,其余均取当前选择的结果,那么看第i个属性所有的值有哪些是存在于组合的
    for (var i = 0; i < propertyValueIndexs.length; i++) {      
      let tmpCompProp = propertyValueIndexs.slice(0);
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

    // 更新选择
    that.setData({
      goodsSelection: that.data.goodsSelection,
      propertyValueNames: propertyValueNames,
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
            that.setData({
              goodsDetail: r.data.data.goodsDetail,
            });
        },
        complete: function () {
            wx.hideLoading();
        }
      })
    }
  },

  /**
   * 检查当前的选择是否合法
   * 注意!!!这个方法会更新propertyValueNames
   * 返回skuid,空串则非法
   */
  checkSelection: function () {
    // 获取所有的选中规格尺寸数据
    var properties = this.data.goodsSelection.properties
    var needSelectNum = properties.length;
    var curSelectNum = 0;
    var propertyValueIndexs = [];
    var propertyValueNames = "";
    for (var i = 0; i < properties.length; i++) {
      var childs = properties[i].values;
      var s = false;
      for (var j = 0; j < childs.length; j++) {
        if (childs[j].selected) {
          curSelectNum++;
          s = true;
          propertyValueIndexs.push(j);
          propertyValueNames = propertyValueNames + properties[i].name + ":" + childs[j].name + "  ";
        }
      }
      if (!s)
        propertyValueIndexs.push(-1);
    }

    var skuId = '';
    if (needSelectNum == curSelectNum) {
      let comp = this.data.goodsSelection.composition;
      for (var i = 0; i < comp.length; i++) {
        let value = comp[i];
        if (value.properties.toString() == propertyValueIndexs.toString()) {
          skuId = value.id;
          break;
        }
      };
    }

    this.setData({
      propertyValueNames: propertyValueNames,
    });

    return {
      "skuId": skuId,
      "propertyValueIndexs": propertyValueIndexs,
      "propertyValueNames": propertyValueNames,
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


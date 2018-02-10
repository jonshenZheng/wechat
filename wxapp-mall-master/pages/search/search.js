// page/component/sereach/sereach.js
let app = getApp(),
  rq = app.bzRequest,
  baseURL = app.globalData.svr,
  commJs = require('../common/common.js'),
  pageSize = 15;

Page({
 
    data: {
        showpanCtInd: '',
        showpanCt: [
            { isshow: '' },
            { isshow: '' }
        ],
        minPrice : '',
        maxPrice : '',
        minPrice_befor: '',
        maxPrice_befor: '',

        length : '',
        width : '',
        height: '',
        length_befor: '',
        width_befor: '',
        height_befor: '',

        oldSereachForm : {},
        baseImgUrl: getApp().globalData.baseImgUrl,
        goodsList:[],
        //count:0,
        //imgUuid:''
    },
    dealwithGoodsList : function(arr){
        arr['hasMore'] = arr.prodIntros.length < pageSize ? false : true;
        arr['startPage'] = 1;
    },
    onimgfail : function(e){

        let arr = this.data.goodsList,
            ind = e.currentTarget.dataset.imgind;

        if (e.detail.errMsg.indexOf('noPic.png') === -1) {
            arr.prodIntros[ind].path = '../../image/noPic.png';
            this.setData({
                goodsList: arr
            })
        }
    },
    sortPrice: function (e) {
        let ind = e.currentTarget.dataset.ind,
            val = e.detail.value,
            maxP = this.data.maxPrice,
            minP = this.data.minPrice,
            temp;

        if (ind === '0') {
            minP = val;
        }
        else {
            maxP = val;
        }

        if (maxP !== '' && minP !== '') {
            if (Number(minP) > Number(maxP)) {
                temp = minP;
                minP = maxP;
                maxP = temp;
            }
        }

        this.setData({
            maxPrice: maxP,
            minPrice: minP
        })

    },
    onLoad:function(e){
        
      let searchResult= app.globalData.searchResult;
      if (!searchResult.prodIntros){
          return
      }
      this.dealwithGoodsList(searchResult);
    
      commJs.checkImgExist(searchResult.prodIntros,'path');
      this.setData({
          goodsList: searchResult,
      });

      /*this.setData({
        goodsList: searchResult.prodIntros,
        count: searchResult.producesCount,
        imgUuid: searchResult.imgUuid,
      });*/
    },
    formSubmitFn2: function (e) {
        
        let arr = this.data.goodsList,
            fid = arr.imgUuid,
            oldForm = this.data.oldSereachForm;
            
        if (e.detail.value.minPriceV || e.detail.value.minPriceV === '0' || e.detail.value.maxPriceV || e.detail.value.maxPriceV === '0') {
            /*if ((!e.detail.value.minPriceV && e.detail.value.minPriceV !== '0') && (!e.detail.value.maxPriceV && e.detail.value.maxPriceV !== '0')) {
                wx.showModal({
                    content: '搜索内容不能为空',
                    showCancel : false
                });
                return;
            }*/

            this.setData({
                minPrice: e.detail.value.minPriceV,
                maxPrice: e.detail.value.maxPriceV,
                minPrice_befor: e.detail.value.minPriceV,
                maxPrice_befor: e.detail.value.maxPriceV,
            })
            
            this.getProdData(fid, oldForm.width, oldForm.depth, oldForm.Heigth, e.detail.value.minPriceV, e.detail.value.maxPriceV, 1, arr, '');
        }
        else {

            /*if ((!e.detail.value.lengthV && e.detail.value.lengthV !== '0') && (!e.detail.value.widthV && e.detail.value.widthV !== '0') && (!e.detail.value.heightV && e.detail.value.heightV !== '0')) {
                wx.showModal({
                    title: '提示',
                    content: '搜索内容不能为空',
                });
                return;
            }*/

            this.setData({
                length: e.detail.value.lengthV,
                width: e.detail.value.widthV,
                height: e.detail.value.heightV,
                length_befor: e.detail.value.lengthV,
                width_befor: e.detail.value.widthV,
                height_befor: e.detail.value.heightV,
            });
            
            this.getProdData(fid, e.detail.value.lengthV, e.detail.value.widthV, e.detail.value.heightV, oldForm.minMoney, oldForm.maxMoney, 1, arr, '')
        }

        this.hidepanFn();

    },
    hidepanFn: function (e) {
        
        let arr = this.data.showpanCt;
        arr[this.data.showpanCtInd].isshow = '';

        if (e) {

            let isPrice = e.currentTarget.dataset.cansle == '1' ? true : false;

            if (isPrice) {

                this.setData({
                    maxPrice: this.data.maxPrice_befor,
                    minPrice: this.data.minPrice_befor,
                    showpanCtInd: '',
                    showpanCt: arr
                });

            }
            else {
                this.setData({
                    length: this.data.length_befor,
                    width: this.data.width_befor,
                    height: this.data.height_befor,
                    showpanCtInd: '',
                    showpanCt: arr
                });
            }

        }
        else{
            this.setData({
                showpanCtInd: '',
                showpanCt: arr
            });
        }

    },
    showpanFn: function (e) {

        let ind = e.currentTarget.dataset.ind,
            arr = this.data.showpanCt,
            temp,
            len = arr.length;

        for (; len--;) {
            if (len != ind) {
                arr[len].isshow = '';
            }
            else {
                if (arr[ind].isshow == 'show') {
                    arr[ind].isshow = '';
                    temp = '';
                }
                else {
                    arr[ind].isshow = 'show';
                    temp = ind;
                }
            }
        }

        this.setData({
            showpanCtInd: temp,
            showpanCt: arr
        });

    },
    upload: function () {
    
        let self = this,
            arr = this.data.goodsList,
            oldformVal = this.data.oldSereachForm,
            hasMore = arr.hasMore,
            oldProd,
            sPage,
            cbFn;

        if (!hasMore) {
            return;
        }

        oldProd = [].concat(arr.prodIntros);

        cbFn = function (oldForm) {

            if (arr.prodIntros){
                arr.prodIntros = oldProd.concat(arr.prodIntros);
            }

            self.setData({
                oldSereachForm: oldForm,
                goodsList: arr
            })
        }

        if (
            !oldformVal.width &&
            !oldformVal.depth &&
            !oldformVal.Heigth &&
            !oldformVal.minMoney &&
            !oldformVal.maxMoney
        ) {

            sPage = arr.startPage + 1;
            arr.startPage = sPage;
            this.getProdData(arr.imgUuid, '', '', '', '', '', sPage, arr, '', cbFn);

        }
        else {
            this.getProdData(oldformVal.imgUuid, oldformVal.width, oldformVal.depth, oldformVal.Heigth, oldformVal.minMoney, oldformVal.maxMoney, oldformVal.startPage + 1, arr, '', cbFn, false, );
        }


    },
    getProdData: function (imgid, wid = '', dth = '', hei = '', minMy = '', maxMy = '', sPage = 1, arr, arr_ind, cbFn, isInit, dynamic = []) {

        let self = this,
            sentdata;
        if (!imgid) {
            return;
        }

        sentdata = { imgUuid: imgid, width: wid, depth: dth, Heigth: hei, minMoney: minMy, maxMoney: maxMy, startPage: sPage, pageSize: pageSize };


        rq({
            url: baseURL + 'imageSearch/filter',
            data: JSON.stringify(sentdata),
            method: 'post',
            success: function (pdimg) {
                
                if (!pdimg.data.data.prodIntros) {

                    arr.hasMore = false;
                    arr.prodIntros = [];

                }
                else{

                    let pdarr = pdimg.data.data.prodIntros;

                    if (pdarr.length < pageSize) {
                        arr.hasMore = false;
                    }
                    else {
                        arr.hasMore = true;
                    }

                    arr.prodIntros = [].concat(pdarr);

                }
                
                if (typeof cbFn === 'function') {
                    cbFn(sentdata);
                }
                else {

                    self.setData({
                        oldSereachForm: sentdata,
                        goodsList: arr
                    })
                }

            }
        })

    },
    /*重置规格*/
    resetSize: function (e) {

        this.setData({
            length: '',
            width : '',
            height : ''
        });
    }
   
})
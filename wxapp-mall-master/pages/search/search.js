// page/component/sereach/sereach.js
let app = getApp(),
  rq = app.bzRequest,
  baseURL = app.globalData.svr,
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
            if (minP > maxP) {
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
            fid = arr.imgUuid;
            
        if (e.detail.value.minPriceV || e.detail.value.minPriceV === '0' || e.detail.value.maxPriceV || e.detail.value.maxPriceV === '0') {
            if ((!e.detail.value.minPriceV && e.detail.value.minPriceV !== '0') && (!e.detail.value.maxPriceV && e.detail.value.maxPriceV !== '0')) {
                wx.showModal({
                    content: '搜索内容不能为空',
                    showCancel : false
                });
                return;
            }

            this.getProdData(fid, '', '', '', e.detail.value.minPriceV, e.detail.value.maxPriceV, 1, arr, '');
        }
        else {

            if ((!e.detail.value.lengthV && e.detail.value.lengthV !== '0') && (!e.detail.value.widthV && e.detail.value.widthV !== '0') && (!e.detail.value.heightV && e.detail.value.heightV !== '0')) {
                wx.showModal({
                    title: '提示',
                    content: '搜索内容不能为空',
                });
                return;
            }

            this.getProdData(fid, e.detail.value.lengthV, e.detail.value.widthV, e.detail.value.heightV, '', '', 1, arr, '')
        }

        this.hidepanFn();

    },
    hidepanFn: function () {

        let arr = this.data.showpanCt;
        arr[this.data.showpanCtInd].isshow = '';

        this.setData({
            maxPrice: '',
            minPrice: '',
            showpanCtInd: '',
            showpanCt: arr
        });

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
   
})
let rq = getApp().bzRequest,
    baseUrl = getApp().globalData.svr,
    loadLock = false,
    storageKey = 'category',
    pageStorage,
    commJs = require('../common/common.js'),
    prevSelet = '',
    config = {
        pageSize : 8,
        maxreloadTime: 10000,
    };

Page({
    data: {
        category: [],
        allSelOpt : [],
        allSelOpt_befor: [],
        curIndex: 0,
        isShowPop : '',
        prodScroll : true,
        F_minPrice : '',
        F_maxPrice : '',
        F_width : '',
        F_depth : '',
        F_height : '',
        F_minPrice_bef: '',
        F_maxPrice_bef: '',
        F_width_bef: '',
        F_depth_bef: '',
        F_height_bef: '',
        baseImgUrl: getApp().globalData.baseImgUrl,
        oldSereachForm : {
            prodTypeId: '', 
            width: '', 
            depth: '', 
            Heigth: '',
            minMoney: '', 
            maxMoney: '', 
            startPage: 1, 
            pageSize: config.pageSize, 
            dynamicCondition: [],
            orderByPrice : '',
            orderByWidth : ''
        }, 
        isScroll: false,
        toView: 'cgid0',
        isShowAllopt : '',
        isHideLoadMore:true,
        showpanCtInd : '',
        showpanCt : [
            {isshow : ''},
            {isshow : ''}
        ],
        btnff : '',

    },
    onLoad : function(){
        pageStorage = commJs.getSorageByPage(storageKey, this); 
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
    requestProdType : function(){
        var self = this;
        rq({
            url: baseUrl + 'prodType',
            noErrorLog : true,
            success: function (res) {

                let arr = res.data.data,
                    len = arr.length,
                    upDateStorage, 
                    a_i = 0;

                upDateStorage = function (sentdata){
                    self.setData({
                        oldSereachForm: sentdata
                    })
                    commJs.setStorageByPage(storageKey, self, 'category', pageStorage, arr);
                }

                for (; a_i < len; a_i++) {
                    arr[a_i]['cgid'] = 'cgid' + a_i;
                    arr[a_i]['detail'] = {};
                    arr[a_i]['detail']['towlevel'] = {};
                    arr[a_i]['detail']['towlevel']['sel_ind'] = '';

                    arr[a_i]['detail']['filter'] = {};
                    arr[a_i]['detail']['filter']['maxPrice'] = '';
                    arr[a_i]['detail']['filter']['minPrice'] = '';
                    arr[a_i]['detail']['filter']['maxPrice_befor'] = '';
                    arr[a_i]['detail']['filter']['minPrice_befor'] = '';

                    arr[a_i]['detail']['filter']['length'] = '';
                    arr[a_i]['detail']['filter']['width'] = '';
                    arr[a_i]['detail']['filter']['height'] = '';
                    arr[a_i]['detail']['filter']['length_befor'] = '';
                    arr[a_i]['detail']['filter']['width_befor'] = '';
                    arr[a_i]['detail']['filter']['height_befor'] = '';

                    arr[a_i]['detail']['prod'] = {};
                    arr[a_i]['detail']['prod']['oneLevPd'] = [];
                    arr[a_i]['detail']['prod']['showPd'] = [];
                    arr[a_i]['detail']['prod']['startPage'] = 1;
                    arr[a_i]['detail']['prod']['hasMore'] = false;
                    arr[a_i]['detail']['prod']['proPropertyVals'] = [];
                }
                
                self.dealwithTowlevel(arr);

                self.getProdData(arr[0].id, 1, arr, 0, upDateStorage, true);
                wx.hideLoading();
         
            },
            fail: function (e) {
                wx.hideLoading();
                console.log(e);

                if (config.maxreloadTime > 0) {
                    self.requestProdType();
                    config.maxreloadTime--;
                    console.log('重新第' + config.maxreloadTime + '次请求数据');
                }
                else {
                    wx.showModal({
                        content: '网络异常',
                        showCancel: false
                    })
                }
                
            }
        })
    },
    onReady(){
        wx.showLoading({
            title: '加载中',
        });
        this.requestProdType();

    },
    sortPrice : function(e){
        let ind = e.currentTarget.dataset.ind,
            val = e.detail.value,
            panId = this.data.curIndex,
            arr = this.data.category,
            maxP = arr[panId].detail.filter.maxPrice,
            minP = arr[panId].detail.filter.minPrice,
            temp;
        
        if (ind === '0'){
            minP = val;
        }
        else{
            maxP = val;
        }  

        if (maxP !== '' && minP !== '' ){
            if (Number(minP) > Number(maxP)){
                temp = minP;
                minP = maxP;
                maxP = temp;
            }
        }

        arr[panId].detail.filter.minPrice = minP,
        arr[panId].detail.filter.maxPrice = maxP;

        this.setData({
            category : arr
        })

    },
    //初始化筛选选项
    dealwithallOpt : function(arr){
        
        let i = arr.length,
            v_i,
            temp;

        if(i<1){
            return
        }    

        for(;i--;){

            temp = arr[i].values;
            v_i = temp.length;
            
            if(v_i<1){
                continue;
            }

            if(v_i%2 === 1){
                temp[temp.length] = '';
            }

            arr[i]['sel_ind'] = [];
            temp = arr[i]['sel_ind'];
            
            for(;v_i--;){
                temp[temp.length] = false;
            }

        }

    },
    //选中筛选的一条
    allOptSelOneFn : function(e){
        let i1 = e.currentTarget.dataset.indo,
            i2 = e.currentTarget.dataset.indt,
            arr = this.data.allSelOpt,
            isSel = arr[i1].sel_ind[i2];

        if (isSel){
            arr[i1].sel_ind[i2] = false;
        }
        else{
            arr[i1].sel_ind[i2] = true;
        }

        this.setData({
            allSelOpt : arr
        })

    },
    //重置筛选
    resetAlloptFn : function(){
        let arr = this.data.allSelOpt,
            i1 = arr.length,
            i2,
            temp;

        if(i1 < 1){
            return
        }    

        for(;i1--;){
            temp = arr[i1];
            i2 = temp.sel_ind.length;
            if(i2<1){
                continue;
            }

            for(;i2--;){
                temp.sel_ind[i2] = false;
            }

        }

        this.setData({
            allSelOpt: arr
        });

    },
    //所有筛选处理函数
    filterFn : function(e){
        
        let f_type,
            oldForm = this.data.oldSereachForm,
            parm = {};
        
        if(e){
            f_type = e.currentTarget.dataset.type;
        }
        else{
            /*reset*/
            oldForm.dynamicCondition = [];
            oldForm.maxMoney = '';
            oldForm.minMoney = '';
            oldForm.width = '';
            oldForm.depth = '';
            oldForm.Heigth = '';
            this.setData({
                oldSereachForm : oldForm
            })
            return
        }
        
        switch (f_type){
            case 'dynamic': parm = this.selectAlloptFn(e);
                            oldForm.dynamicCondition = parm.dynamic;
                            oldForm.maxMoney = parm.maxPrice;
                            oldForm.minMoney = parm.minPrice;
                            oldForm.width = parm.width;
                            oldForm.depth = parm.depth;
                            oldForm.Heigth = parm.height;
                break;
            case 'price': 
            case 'shape':   parm = this.formSubmitFn2(e);
                            oldForm.maxMoney = parm.maxMoney != -1 ? parm.maxMoney : oldForm.maxMoney;
                            oldForm.minMoney = parm.minMoney != -1 ? parm.minMoney : oldForm.minMoney;
                            oldForm.width = parm.length != -1 ? parm.length : oldForm.width;
                            oldForm.depth = parm.width != -1 ? parm.width : oldForm.depth;
                            oldForm.Heigth = parm.height != -1 ? parm.height : oldForm.Heigth;

                break;
        }
        
        //this.getProdByPram(cgarr[ind].id, 1, cgarr, ind,'',false,arr);

        this.setData({
            oldSereachForm: oldForm
        });

        /*this.getProdData(parm.id, oldForm.width, oldForm.depth, oldForm.Heigth, oldForm.minMoney, oldForm.maxMoney, 1, parm.arr, parm.ind, '', false, oldForm.dynamicCondition);*/

        this.getProdData(parm.id, 1, parm.arr, parm.ind, '', false);

    },
    dealwithTowlevel : function(arr){
        
        let len = arr.length,
            temp,
            v_i,
            c_i = 0;

        if(len < 1){
            return;
        }    
        for(;len--;){
            temp = arr[len].children;
            v_i = temp.length;
            if(v_i < 1){
                continue
            }
            for (; v_i--;){
                temp[v_i]['isSel'] = '';
            }
        }

    },
    scrollTo: function (eid, eind, oval){
        
        let self = this;

        if (oval){
            this.setData({
                //allSelOpt: oval[eind].detail.prod.proPropertyVals,
                category: oval,
                isScroll: true
            })
        }
        else{
            this.setData({
                //allSelOpt: this.data.category[eind].detail.prod.proPropertyVals,
                isScroll: true
            })
        }
        
        setTimeout(function () {
            self.setData({
                toView: eid,
                curIndex: eind
            })
        }, 0)
        setTimeout(function () {
            self.setData({
                isScroll: false
            })
        }, 1)
    },
    /*getProdData: function (fid, wid = '', dth = '', hei = '', minMy = '', maxMy = '', sPage = 1, arr, arr_ind, cbFn, isInit, dynamic = [])*/
    getProdData: function (fid, sPage = 1, arr, arr_ind, cbFn, isInit){
        
        let self = this,
            oldForm = this.data.oldSereachForm,
            sentdata;

        if(!fid && fid !== 0){
            return;
        }

        sentdata = { 
            prodTypeId: fid, 
            width: oldForm.width, 
            depth: oldForm.depth, 
            Heigth: oldForm.Heigth, 
            minMoney: oldForm.minMoney, 
            maxMoney: oldForm.maxMoney,
            startPage: sPage,
            pageSize: config.pageSize, 
            dynamicCondition: oldForm.dynamicCondition,
            orderByPrice: oldForm.orderByPrice,
            orderByWidth: oldForm.orderByWidth
        };
        
        rq({
            url: baseUrl + 'produce/toListProduces',
            data: JSON.stringify(sentdata),
            method: 'post',
            success: function (pdimg) {

                if (!pdimg.data.data){
                    //进来报错
                    self.setData({
                        category: arr
                    })
                    return
                }

                commJs.checkImgExist(pdimg.data.data.prodIntros, 'path');

                let pdarr = pdimg.data.data.prodIntros;
            
                if (pdarr.length < config.pageSize) {
                    arr[arr_ind]['detail']['prod']['hasMore'] = false;
                }
                else{
                    arr[arr_ind]['detail']['prod']['hasMore'] = true;
                }

                if (isInit){
                    arr[arr_ind]['detail']['prod']['oneLevPd'] = [].concat(pdarr);
                    //arr[arr_ind]['detail']['prod']['proPropertyVals'] = [].concat(proPVals);
                }              

                arr[arr_ind]['detail']['prod']['showPd'] = [].concat(pdarr);

                if(typeof cbFn === 'function'){
                    cbFn(sentdata);
                }
                else{
   
                    self.setData({
                        oldSereachForm: sentdata,
                        category: arr
                    })

                }

            },
            complete : function(){
                loadLock = false;
            }
        })

    },
    resetTab: function (arr,ind) {
        
        this.resetAlloptFn();

        let towlevelInd = arr[ind].detail.towlevel.sel_ind;
        if (towlevelInd !== ''){
            arr[ind].children[towlevelInd].isSel = '';
        }

        this.setData({
            showpanCt: [
                        { isshow: '' },
                        {isshow: '' }
                        ]
        });


        let arrlen = arr.length,
            arr_i = 0;

        for (; arr_i < arrlen; arr_i++){
            arr[arr_i].isshow = '';
        }

        arr[ind]['detail']['towlevel']['sel_ind'] = '';

        arr[ind]['detail']['prod']['startPage'] = 1;
        arr[ind]['detail']['prod']['hasMore'] = arr[ind].detail.prod.oneLevPd.length >= config.pageSize ? true : false;

        arr[ind]['detail']['filter']['maxPrice'] = '';
        arr[ind]['detail']['filter']['minPrice'] = '';
        arr[ind]['detail']['filter']['maxPrice_befor'] = '';
        arr[ind]['detail']['filter']['minPrice_befor'] = '';

        arr[ind]['detail']['filter']['length'] = '';
        arr[ind]['detail']['filter']['width'] = '';
        arr[ind]['detail']['filter']['height'] = '';
        arr[ind]['detail']['filter']['length_befor'] = '';
        arr[ind]['detail']['filter']['width_befor'] = '';
        arr[ind]['detail']['filter']['height_befor'] = '';

    },
    switchTab(e){
     
        let ind = e.currentTarget.dataset.index,
            self = this,
            arr = this.data.category,
            fid = e.currentTarget.dataset.fid,
            eid = e.target.dataset.id,
            prveind = this.data.curIndex,
            fromParm = {
                prodTypeId: fid,
                width: '',
                depth: '',
                Heigth: '',
                minMoney: '',
                maxMoney: '',
                startPage: 1,
                pageSize: config.pageSize,
                dynamicCondition: []
            }; 

        this.setData({
            oldSereachForm: fromParm
        });     

        this.resetTab(arr,prveind);

        if (!arr[ind]['detail']['prod']['oneLevPd'].length ){

            let cb = function (odlform) {
                self.scrollTo(eid, ind, arr, odlform);
            };

            self.getProdData(arr[ind].id, 1, arr, ind, cb, true);
        }
        else{

            arr[ind].detail.prod.showPd = arr[ind].detail.prod.oneLevPd;
            self.scrollTo(eid, ind,arr);
        }

    },
    upload : function(){
        
        let self = this,
            arr = this.data.category,
            arr_ind = this.data.curIndex,
            oldformVal = this.data.oldSereachForm,
            hasMore = arr[arr_ind].detail.prod.hasMore,
            oldProd,
            sPage,
            id,
            cbFn;

        if (!hasMore || loadLock){
            return;
        }

        loadLock = true;

        oldProd = [].concat(arr[arr_ind].detail.prod.showPd );

        cbFn = function(oldForm){ 
            arr[arr_ind].detail.prod.showPd = oldProd.concat( arr[arr_ind].detail.prod.showPd );

            self.setData({
                oldSereachForm: oldForm,
                category: arr
            });

        }

        if ( arr[arr_ind].detail.towlevel.sel_ind !== '' ){
            id = oldformVal.prodTypeId;
        }
        else{
            id = arr[arr_ind].id;
        }

        this.getProdData(id, oldformVal.startPage + 1, arr, arr_ind, cbFn);
    },
    selLevel : function(e){
        
        let fid = e.currentTarget.dataset.fid,
            tabind = e.currentTarget.dataset.tabind,
            ltId = e.currentTarget.dataset.listid,
            temp = this.data.category,
            thisData = temp[tabind].detail.towlevel,
            curSelInd = thisData.sel_ind,
            self = this;

        this.filterFn();

        if (!curSelInd && curSelInd !== 0){
            this.resetTab(temp, tabind);
            temp[tabind].detail.towlevel.sel_ind = ltId;
            temp[tabind].children[ltId].isSel = 'on';
            //请求二级产品数据
            this.getProdData(fid, 1, temp, tabind);

        }  
        else{

            if (curSelInd !== ltId){
                //temp[tabind].children[curSelInd].isSel = '';
                let len_i = temp[tabind].children.length;
                if (len_i < 1){
                    return
                }
                for (; len_i--;){
                    if (len_i != ltId ){
                        temp[tabind].children[len_i].isSel = '';
                    }
                }
            }           

            if (temp[tabind].children[ltId].isSel == 'on' ){
                this.resetTab(temp, tabind);
                temp[tabind].children[ltId].isSel = '';
                temp[tabind].detail.towlevel.sel_ind = '';
                //还原大类产品
                temp[tabind].detail.prod.showPd = [].concat( temp[tabind].detail.prod.oneLevPd )

                this.setData({
                    //allSelOpt: temp[tabind].detail.prod.proPropertyVals,
                    category: temp
                });

            }
            else{
                this.resetTab(temp, tabind);
                temp[tabind].children[ltId].isSel = 'on';
                temp[tabind].detail.towlevel.sel_ind = ltId;
                //请求二级产品数据
                this.getProdData(fid, 1, temp, tabind);
            }

        }  

    },
    formSubmitFn2 : function(e){
        
        let arr = this.data.category,
            arr_ind = this.data.curIndex,
            fid,
            oldForm = this.data.oldSereachForm,
            towlevInd = arr[arr_ind].detail.towlevel.sel_ind;

        if (towlevInd || towlevInd === 0 ){
            fid = arr[arr_ind].children[towlevInd].id;
        }
        else{
            fid = arr[arr_ind].id;
        }
        
        this.hidepanFn();

        if (e.detail.value.minPriceV || e.detail.value.minPriceV === '0' || e.detail.value.maxPriceV || e.detail.value.maxPriceV === '0' ){
            /*if ( (!e.detail.value.minPriceV && e.detail.value.minPriceV !== '0') && (!e.detail.value.maxPriceV && e.detail.value.maxPriceV !== '0' ) ){
                wx.showModal({
                    title: '提示',
                    content: '搜索内容不能为空',
                });
                return;
            }*/
 
            //设置历史搜索
            arr[arr_ind].detail.filter.maxPrice = e.detail.value.maxPriceV;
            arr[arr_ind].detail.filter.minPrice = e.detail.value.minPriceV;
            arr[arr_ind].detail.filter.maxPrice_befor = e.detail.value.maxPriceV;
            arr[arr_ind].detail.filter.minPrice_befor = e.detail.value.minPriceV;

            return {
                id: fid,
                maxMoney: e.detail.value.maxPriceV,
                minMoney: e.detail.value.minPriceV,
                length: -1,
                width: -1,
                height: -1,
                arr : arr,
                ind: arr_ind
            };

            // this.getProdData(fid, oldForm.width, oldForm.depth, oldForm.Heigth, e.detail.value.minPriceV, e.detail.value.maxPriceV, 1, arr, arr_ind, '', false, oldForm.dynamicCondition);
        }
        else{

            // if ((!e.detail.value.lengthV && e.detail.value.lengthV !== '0') && (!e.detail.value.widthV && e.detail.value.widthV !== '0') && (!e.detail.value.heightV && e.detail.value.heightV !== '0') ){
            //     wx.showModal({
            //         title: '提示',
            //         content: '搜索内容不能为空',
            //     });
            //     return;
            // }

            //设置历史搜索
            arr[arr_ind].detail.filter.length = e.detail.value.lengthV;
            arr[arr_ind].detail.filter.width = e.detail.value.widthV;
            arr[arr_ind].detail.filter.height = e.detail.value.heightV;
            arr[arr_ind].detail.filter.length_befor = e.detail.value.lengthV;
            arr[arr_ind].detail.filter.width_befor = e.detail.value.widthV;
            arr[arr_ind].detail.filter.height_befor = e.detail.value.heightV;

            return {
                id: fid,
                maxMoney: -1,
                minMoney: -1,
                length: e.detail.value.lengthV,
                width: e.detail.value.widthV,
                height: e.detail.value.heightV,
                arr: arr,
                ind: arr_ind
            };

            // this.getProdData(fid, e.detail.value.lengthV, e.detail.value.widthV, e.detail.value.heightV, oldForm.minMoney, oldForm.maxMoney, 1, arr, arr_ind, '', false, oldForm.dynamicCondition);
        }

        

    },
    hidepanFn : function(e){
        
        let arr = this.data.showpanCt,
            showpanCtInd = this.data.showpanCtInd,
            curInd = this.data.curIndex,
            category = this.data.category;

        if(e){

            let isPrice = e.currentTarget.dataset.cansle == '1' ? true : false;

            if (isPrice){
                category[curInd].detail.filter.maxPrice = category[curInd].detail.filter.maxPrice_befor;
                category[curInd].detail.filter.minPrice = category[curInd].detail.filter.minPrice_befor;
            }
            else{
                category[curInd].detail.filter.length = category[curInd].detail.filter.length_befor;
                category[curInd].detail.filter.width = category[curInd].detail.filter.width_befor;
                category[curInd].detail.filter.height = category[curInd].detail.filter.height_befor;
            }
            
        }

        arr[showpanCtInd].isshow = '';

        /*category[curInd].detail.filter.minPrice = '',
        category[curInd].detail.filter.maxPrice = '';*/
        
        this.setData({
            showpanCtInd: '',
            showpanCt: arr,
            category: category 
        });

    },
    showpanFn: function(e){
        
        let ind = e.currentTarget.dataset.ind,
            arr = this.data.showpanCt,
            panInd = e.currentTarget.dataset.panind,
            temp,
            cagrage = this.data.category,
            showid = 'show' + panInd,
            oldform = this.data.oldSereachForm,
            sort = '',
            fid = '',
            towlevInd = cagrage[panInd].detail.towlevel.sel_ind,
            len = arr.length;
        
        for (;len--;){
            if(len != ind){
                arr[len].isshow = '';
            }
            else{

                if (arr[ind].isshow == ''){
                    //向上
                    arr[ind].isshow = showid+'up';
                    temp = ind;
                    sort = 'asc';
                }
                else if (arr[ind].isshow == (showid + 'up')){
                    //向下
                    arr[ind].isshow = showid + 'down';
                    temp = ind;
                    sort = 'desc';
                }
                else if (arr[ind].isshow == (showid + 'down')){
                    //还原
                    arr[ind].isshow = '';
                    temp = '';
                    sort = '';
                }

            }
        }

        if (ind == '0'){
            oldform.orderByWidth = '';
            oldform.orderByPrice = sort;
        }
        else{
            oldform.orderByPrice = '';
            oldform.orderByWidth = sort;
        }
        
        this.setData({
            showpanCtInd: temp,
            showpanCt: arr
        });

        //请求数据
        if (towlevInd || towlevInd === 0) {
            fid = cagrage[panInd].children[towlevInd].id;
        }
        else {
            fid = cagrage[panInd].id;
        }
        this.getProdData(fid, 1, cagrage, panInd);

    },
    showAlloptFn : function(){
        
        let arr = this.data.category,
            ind = this.data.curIndex,
            sel_ind = arr[ind].detail.towlevel.sel_ind,
            fid,
            self = this;

        if (sel_ind || sel_ind === 0 ){
            fid = arr[ind].children[sel_ind].id;
        }
        else{
            fid = arr[ind].id;
        }
        
        if (fid == prevSelet){
            self.setData({
                isShowAllopt: 'show',
                isShowPop : true,
                prodScroll : false
            });
            return;
        }

        function loadfail(){
            wx.showToast({
                title: '加载失败',
            })
        }

        rq({
            url: baseUrl +'getFilterProperty/'+fid,
            success : function(r){
                
                if(r.data.meta && r.data.meta.code == 200){
                    let optobj = r.data.data;
                    self.dealwithallOpt(r.data.data)
                    self.setData({
                        allSelOpt: [].concat(optobj),
                        allSelOpt_befor : [].concat(optobj),
                        isShowAllopt: 'show',
                        isShowPop: true,
                        prodScroll :false
                    })
                }
                else{
                    loadfail();
                }
            },
            fail : function(){
                loadfail();
            },
            complete : function(){
                prevSelet = fid;
            }
        });

    },
    hideAlloptFn : function(e){
        
        this.setData({
            isShowAllopt: '',
            allSelOpt: this.data.allSelOpt_befor,
            isShowPop: false,
            prodScroll :true,
            F_minPrice: this.data.F_minPrice_bef,
            F_maxPrice: this.data.F_maxPrice_bef,
            F_width: this.data.F_width_bef,
            F_depth: this.data.F_depth_bef,
            F_height: this.data.height_bef
        });
    },
    selectAlloptFn : function(e){
        
        let arr = [],
            checkV = e.detail.value,
            cgarr = this.data.category,
            ind = this.data.curIndex,
            temp,
            oldForm = this.data.oldSereachForm,
            fid,
            newArr = this.data.allSelOpt.slice(),
            newArr_len,
            key;

        if (newArr_len >= 1){
            for (; newArr_len--;){
                newArr[newArr_len].sel_ind = newArr[newArr_len].sel_ind.slice();
            }
        }

        this.setData({
            allSelOpt_befor: newArr
        })    

        for (key in checkV){
            if ( typeof checkV[key] != 'object'){
                continue;
            }
            temp = e.detail.value[key];
            if (temp.length >= 1) {
                arr[arr.length] = key+':'+temp.join(';');
                //arr[arr.length] = temp.join(';');
            }
        }    

        //this.getProdByPram(cgarr[ind].id, 1, cgarr, ind,'',false,arr);    

        fid = oldForm.prodTypeId ? oldForm.prodTypeId : cgarr[ind].id;
        
        this.setData({
            F_minPrice: checkV.minPriceV,
            F_maxPrice: checkV.maxPriceV,
            F_width: checkV.width,
            F_depth: checkV.depth,
            F_height: checkV.height,
            F_minPrice_bef: checkV.minPriceV,
            F_maxPrice_bef: checkV.maxPriceV,
            F_width_bef: checkV.width,
            F_depth_bef: checkV.depth,
            F_height_bef: checkV.height,
        });

        this.hideAlloptFn();

        return {
            id: fid,
            arr: cgarr,
            ind: ind,
            dynamic: arr,
            minPrice: checkV.minPriceV,
            maxPrice: checkV.maxPriceV,
            width: checkV.width,
            depth: checkV.depth,
            height: checkV.height
        }

    },
    loadimgfail : function(e){
        let arr = this.data.category,
            ind = e.currentTarget.dataset.imgind;
        
        if (e.detail.errMsg.indexOf('noPic.png') === -1){
            arr[this.data.curIndex].detail.prod.showPd[ind].path = '../../image/noPic.png'; 
            this.setData({
                category : arr
            })
        }
    },
    /*重置规格*/
    resetSize : function(e){
        let ind = e.currentTarget.dataset.cgind,
            arr = this.data.category;

        arr[ind].detail.filter.length = '';
        arr[ind].detail.filter.width = '';
        arr[ind].detail.filter.height = '';

        this.setData({
            category : arr
        });
    }
    
})


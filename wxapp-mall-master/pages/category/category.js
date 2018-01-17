
let rq = getApp().bzRequest,
    baseUrl = getApp().globalData.svr,
    config = {
        pageSize : 8,
    };

Page({
    data: {
        category: [],
        allSelOpt : [],
        curIndex: 0,
        minPrice : '',
        maxPrice : '',
        baseImgUrl: getApp().globalData.baseImgUrl,
        oldSereachForm : '', 
        isScroll: false,
        toView: 'cgid0',
        isShowAllopt : '',
        isHideLoadMore:true,
        showpanCtInd : '',
        showpanCt : [
            {isshow : ''},
            {isshow : ''}
        ]
    },
    onReady(){
        wx.showLoading({
            title: '加载中',
        });
        var self = this;
        rq({
            url: baseUrl+'prodType',
            success : function(res){
        
                let arr = res.data.data,
                    len = arr.length,
                    a_i = 0;

                for (; a_i < len; a_i++){
                    arr[a_i]['cgid'] = 'cgid' + a_i;
                    arr[a_i]['detail'] = {};
                    arr[a_i]['detail']['towlevel'] = {};
                    arr[a_i]['detail']['towlevel']['sel_ind'] = ''; 
                    arr[a_i]['detail']['towlevel']['list'] = res.data.data[a_i].children;
                    arr[a_i]['detail']['filter'] = {};
                    arr[a_i]['detail']['filter']['maxPrice'] = '';
                    arr[a_i]['detail']['filter']['minPrice'] = '';
                    arr[a_i]['detail']['prod'] = {};
                    arr[a_i]['detail']['prod']['oneLevPd'] = [];
                    arr[a_i]['detail']['prod']['showPd'] = [];
                    arr[a_i]['detail']['prod']['startPage'] = 1;
                    arr[a_i]['detail']['prod']['hasMore'] = false;
                    arr[a_i]['detail']['prod']['proPropertyVals'] = [];
                }

                self.getProdData(arr[0].id, '', '', '', '', '', 1, arr, 0, '', true);
                wx.hideLoading();
                /*rq({
                    url: baseUrl+'prodType/' + arr[0].fid,
                    success: function (res2) {
                        wx.hideLoading();
                        let tarr = res2.data.data.prodTypes,
                            proPVals = res2.data.data.proPropertyVals;
                         
                        self.dealwithTowlevel(tarr);  

                        if (proPVals) {
                            self.dealwithallOpt(proPVals);
                        }
                        else{
                            proPVals = [];
                        }
                         
                        arr[0]['detail']['towlevel']['list'] = [].concat(tarr);
                        arr[0]['detail']['prod']['proPropertyVals'] = [].concat(proPVals);

                        self.setData({
                            allSelOpt: [].concat(proPVals)
                        });

                        self.getProdData(arr[0].fid,'','','','','',1,arr,0,'',true);
                        
                    }

                })*/
            },
            fail : function(e){
                wx.hideLoading();
                console.log(e)
            }
        })

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
            if (minP > maxP){
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
    dealwithallOpt : function(arr){
        
        let i = arr.length,
            v_i,
            temp;

        if(i<1){
            return
        }    

        for(;i--;){

            temp = arr[i].values
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
    dealwithTowlevel : function(arr){
        let tlarr = arr,
            len = tlarr.length,
            c_i = 0;
            

        for (; c_i<len;c_i++){
            tlarr[c_i]['isSel'] = '';
        }

    },
    scrollTo: function (eid, eind, oval, odlform){
        
        let self = this;
        if (oval){
            this.setData({
                //allSelOpt: oval[eind].detail.prod.proPropertyVals,
                oldSereachForm : odlform,
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
    getProdData: function (fid, wid = '', dth = '', hei = '', minMy = '', maxMy = '', sPage = 1, arr, arr_ind, cbFn, isInit, dynamic =[]){
        
        let self = this,
            sentdata;
        if(!fid && fid !== 0){
            return;
        }

        sentdata = { prodTypeId: fid, width: wid, depth: dth, Heigth: hei, minMoney: minMy, maxMoney: maxMy, startPage: sPage, pageSize: config.pageSize, dynamicCondition: dynamic};
        
        rq({
            url: baseUrl + 'produce/toListProduces/',
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

                let pdarr = pdimg.data.data.prodIntros;
                /*    proPVals = pdimg.data.data.proPropertyVals;

                if (proPVals){
                    self.dealwithallOpt(proPVals);
                }*/
                    
                
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

                    if (dynamic.length == 0){
                        self.setData({
                            //allSelOpt: [].concat(proPVals),
                            oldSereachForm: sentdata,
                            category: arr
                        })
                    } 
                    else{
                        self.setData({
                            oldSereachForm: sentdata,
                            category: arr
                        })
                    }

                }

            }
        })

    },
    switchTab(e){
        
        let ind = e.currentTarget.dataset.index,
            self = this,
            arr = this.data.category,
            fid = e.currentTarget.dataset.fid,
            eid = e.target.dataset.id,
            eind = e.target.dataset.index;  

        if (!arr[ind]['detail']['prod']['oneLevPd'].length ){

            let cb = function (odlform) {
                self.scrollTo(eid, eind, arr, odlform);
            };

            self.getProdData(arr[ind].id, '', '', '', '', '', 1, arr, ind, cb, true);

            /*rq({
                url: baseUrl + 'prodType/' + fid,
                success : function(r){
                    
                    let tarr = r.data.data.prodTypes,
                        proPVals = r.data.data.proPropertyVals,
                        cb = function(odlform){
                            self.scrollTo(eid, eind, arr, odlform);
                        };

                    self.dealwithTowlevel(tarr);

                    if (proPVals) {
                        self.dealwithallOpt(proPVals);
                    }
                    else{
                        proPVals = [];
                    }

                    arr[ind]['detail']['towlevel']['list'] = [].concat(tarr);
                    arr[ind]['detail']['prod']['proPropertyVals'] = [].concat(proPVals);

                    self.getProdData(arr[ind].fid, '','', '', '', '', 1, arr, ind, cb,true);

                }
            });*/

    
        }
        else{
            self.scrollTo(eid, eind);
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
            cbFn;

        if (!hasMore){
            return;
        }

        oldProd = [].concat(arr[arr_ind].detail.prod.showPd );

        cbFn = function(oldForm){ 
            arr[arr_ind].detail.prod.showPd = oldProd.concat( arr[arr_ind].detail.prod.showPd );

            self.setData({
                oldSereachForm: oldForm,
                category: arr
            })
        }

        if (
            arr[arr_ind].detail.towlevel.sel_ind !== '' ||   
            oldformVal.width !== '' ||
            oldformVal.depth !== '' ||
            oldformVal.Heigth !== '' ||
            oldformVal.minMoney !== '' ||
            oldformVal.maxMoney !== '',
            oldformVal.dynamicCondition.length >= 1
            ){

            this.getProdData(oldformVal.prodTypeId, oldformVal.width, oldformVal.depth, oldformVal.Heigth, oldformVal.minMoney, oldformVal.maxMoney, oldformVal.startPage + 1, arr, arr_ind, cbFn, false,oldformVal.dynamicCondition);

        }
        else{
            sPage = arr[arr_ind].detail.prod.startPage + 1;
            arr[arr_ind].detail.prod.startPage = sPage;
            this.getProdData(arr[arr_ind].id, '', '', '', '', '', sPage, arr, arr_ind, cbFn);
        }


    },
    selLevel : function(e){
        
        let fid = e.currentTarget.dataset.fid,
            tabind = e.currentTarget.dataset.tabind,
            ltId = e.currentTarget.dataset.listid,
            temp = this.data.category,
            thisData = temp[tabind].detail.towlevel,
            curSelInd = thisData.sel_ind,
            self = this;

        function setSecondMuneSlectOpt(fid){

            rq({
                url: baseUrl +'getFilterProperty/'+fid,
                success : function(r){
                    
                    let proPVals = r.data.data;
 
                    if (proPVals) {
                        self.dealwithallOpt(proPVals);
                    }
                    else {
                        proPVals = [];
                    }

                    self.setData({
                        allSelOpt: [].concat(proPVals)
                    })
 
                }
            });

        }

        if (!curSelInd && curSelInd !== 0){
            temp[tabind].detail.towlevel.sel_ind = ltId;
            temp[tabind].detail.towlevel.list[ltId].isSel = 'on';
            //请求二级产品数据
            this.getProdData(fid, '', '', '', '', '', 1, temp, tabind);

            //请求二级筛选条件
            setSecondMuneSlectOpt(fid);

        }  
        else{

            if (curSelInd !== ltId){
                temp[tabind].detail.towlevel.list[curSelInd].isSel = '';
            }           

            if (temp[tabind].detail.towlevel.list[ltId].isSel == 'on' ){
                temp[tabind].detail.towlevel.list[ltId].isSel = '';
                temp[tabind].detail.towlevel.sel_ind = '';
                //还原大类产品
                temp[tabind].detail.prod.showPd = [].concat( temp[tabind].detail.prod.oneLevPd )

                this.setData({
                    //allSelOpt: temp[tabind].detail.prod.proPropertyVals,
                    category: temp
                });

            }
            else{
                temp[tabind].detail.towlevel.list[ltId].isSel = 'on';
                temp[tabind].detail.towlevel.sel_ind = ltId;
                //请求二级产品数据
                this.getProdData(fid, '', '', '', '', '', 1, temp, tabind);
                //请求二级筛选条件
                setSecondMuneSlectOpt(fid);
            }

        }  

    },
    formSubmitFn2 : function(e){
        let arr = this.data.category,
            arr_ind = this.data.curIndex,
            fid,
            oldForm = this.data.oldSereachForm,
            towLveInd = arr[arr_ind]['detail']['towlevel']['sel_ind'],
            towlevInd = arr[arr_ind].detail.towlevel.sel_ind;

        if (towlevInd || towlevInd === 0 ){
            fid = arr[arr_ind].detail.towlevel.list[towlevInd].id;
        }
        else{
            fid = arr[arr_ind].id;
        }
        

        if (e.detail.value.minPriceV || e.detail.value.minPriceV === '0' || e.detail.value.maxPriceV || e.detail.value.maxPriceV === '0' ){
            if ( (!e.detail.value.minPriceV && e.detail.value.minPriceV !== '0') && (!e.detail.value.maxPriceV && e.detail.value.maxPriceV !== '0' ) ){
                wx.showModal({
                    title: '提示',
                    content: '搜索内容不能为空',
                });
                return;
            }
 
            this.getProdData(fid, '', '', '', e.detail.value.minPriceV, e.detail.value.maxPriceV, 1, arr, arr_ind, '', false, oldForm.dynamicCondition);
        }
        else{

            if ((!e.detail.value.lengthV && e.detail.value.lengthV !== '0') && (!e.detail.value.widthV && e.detail.value.widthV !== '0') && (!e.detail.value.heightV && e.detail.value.heightV !== '0') ){
                wx.showModal({
                    title: '提示',
                    content: '搜索内容不能为空',
                });
                return;
            }
            
            this.getProdData(fid, e.detail.value.lengthV, e.detail.value.widthV, e.detail.value.heightV, '', '', 1, arr, arr_ind, '', false, oldForm.dynamicCondition);
        }

        this.hidepanFn();

    },
    hidepanFn : function(){
        
        let arr = this.data.showpanCt,
            showpanCtInd = this.data.showpanCtInd,
            curInd = this.data.curIndex,
            category = this.data.category;

        arr[showpanCtInd].isshow = '';

        category[curInd].detail.filter.minPrice = '',
        category[curInd].detail.filter.maxPrice = '';

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
            showid = 'show' + panInd,
            len = arr.length;
        
        for (;len--;){
            if(len != ind){
                arr[len].isshow = '';
            }
            else{
                if (arr[ind].isshow == showid){
                    arr[ind].isshow = '';
                    temp = '';
                }
                else{
                    arr[ind].isshow = showid;
                    temp = ind;
                }
            }
        }
        
        this.setData({
            showpanCtInd: temp,
            showpanCt: arr
        });

    },
    showAlloptFn : function(){

        let arr = this.data.category,
            ind = this.data.curIndex,
            sel_ind = arr[ind].detail.towlevel.sel_ind,
            fid,
            self = this;

        if (sel_ind || sel_ind === 0 ){
            fid = arr[ind].detail.towlevel.list[sel_ind].id;
        }
        else{
            fid = arr[ind].id;
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
                        isShowAllopt: 'show'
                    })
                }
                else{
                    loadfail();
                }
            },
            fail : function(){
                loadfail();
            }
        });

    },
    hideAlloptFn : function(){
        this.setData({
            isShowAllopt: ''
        })
    },
    selectAlloptFn : function(e){
        
        let arr = [],
            checkV = e.detail.value,
            cgarr = this.data.category,
            ind = this.data.curIndex,
            temp,
            key;

        for (key in checkV){
            temp = e.detail.value[key];
            if (temp.length >= 1) {
                arr[arr.length] = temp.join(';');
            }
        }    


        this.getProdData(cgarr[ind].id, '', '', '', '', '', 1, cgarr, ind, '', false, arr);

        this.hideAlloptFn();       

    },
    loadingfail : function(e){
        let arr = this.data.category,
            ind = e.currentTarget.dataset.imgind;
        
        if (e.detail.errMsg.indexOf('noPic.jpg') === -1){
            arr[this.data.curIndex].detail.prod.showPd[ind].path = '../../../image/noPic.jpg'; 
            this.setData({
                category : arr
            })
        }
    }
    
})


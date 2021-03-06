// page/component/new-pages/cart/cart.js

//获取应用实例
let app = getApp(),
    rq = app.bzRequest,
    storageKey = 'cart',
    pageStorage,
    commJS = require("../common/common.js"),
    baseURL = app.globalData.svr;

Page({
    data: {
        showBindPhone: false,
        carts: [],               // 购物车列表
        totalPrice: 0,           // 总价，初始为0
        allSelected: false,    // 全选状态
        selNum: 0,             //统计已选家具数量
        baseImgUrl: getApp().globalData.baseImgUrl,
        noSelect: true, //未选中任一商品
        btnff: '',
    },
    onReady: function () {
        pageStorage = commJS.getSorageByPage(storageKey, this);
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
    dealwithCarT: function (arr) {
        if (!arr.length) {
            return;
        }
        let i = arr.length,
            maxNum;

        for (; i--;) {

            maxNum = arr[i].maxNum || 9999;

            arr[i]['maxNum'] = maxNum;

            arr[i]['curDisabled'] = arr[i].count <= 1 ? true : false;

            arr[i]['addDisabled'] = arr[i].count >= (maxNum - 1) ? true : false;

            arr[i]['isSel'] = false;
            arr[i]['isShowDel'] = false;

            arr[i]['selected'] = false;

        }

    },
    onimgfail: function (e) {
        let arr = this.data.carts,
            self = this;

        commJS.loadimgfail(arr, e, 'carts', 'imgUrl', self);
    },
    onShow: function () {
        var that = this
        //this.getTotalPrice();
        //请求购物车数据
        rq({
            url: baseURL + 'shopcart',
            withoutToken: false,
            success: function (r) {

                let cartItems = r.data.data;

                that.dealwithCarT(cartItems);

                commJS.checkImgExist(cartItems, 'imgUrl');

                let carts = that.data.carts;

                for (var i = 0; i < cartItems.length; i++) {
                    for (var j = 0; j < carts.length; j++) {
                        if (cartItems[i].id == carts[j].id) {
                            cartItems[i].selected = carts[j].selected;
                            break;
                        }
                    }
                }
                that.setData({
                    carts: cartItems,
                });
                commJS.setStorageByPage(storageKey, that, 'cart', pageStorage, cartItems);
                that.getTotalPrice();
            }
        })
    },

    /**
     * 删除购物车当前商品
     */
    removeGoodsFromCart(e) {
        var that = this;
        var id = e.currentTarget.dataset.id;
        const index = e.currentTarget.dataset.index;
        let carts = this.data.carts;
        rq({
            url: baseURL + 'shopcart/' + id,
            method: 'DELETE',
            withoutToken: false,
            success: function (r) {

                carts.splice(index, 1);
                that.setData({
                    carts: carts
                });
                that.getTotalPrice();

            }
        });
    },

    limitNum: function (e) {

        let val = Number(e.detail.value),
            ind = e.currentTarget.dataset.arrind,
            arr = this.data.carts,
            min = 1,
            max = 200;



        if (val < min) {
            val = min;
        }
        else if (val > max) {
            val = max;
        }

        this.sentCount(ind, val);
    },

    sentCount: function (ind, val) {

        let arr = this.data.carts,
            id = arr[ind].id,
            count = val,
            that = this;

        rq({
            url: baseURL + 'shopcart/' + id + '/' + count,
            method: 'PUT',
            withoutToken: false,
            success: function (r) {
                arr[ind].count = count;
                that.setData({
                    carts: arr,
                });
                that.getTotalPrice();
            }
        })
    },

    /**
     * 当前商品选中事件
     */
    selectGoodsInCart(e) {

        const index = e.currentTarget.dataset.index;
        let carts = this.data.carts;
        const selected = carts[index].selected;
        carts[index].selected = !selected;
        this.setData({
            carts: carts
        });
        this.getTotalPrice();
    },

    /**
     * 购物车全选事件
     */
    selectAll(e) {

        let allSelected = this.data.allSelected;
        allSelected = !allSelected;
        let carts = this.data.carts;

        for (let i = 0; i < carts.length; i++) {
            carts[i].selected = allSelected;
        }
        this.setData({
            allSelected: allSelected,
            carts: carts
        });
        this.getTotalPrice();
    },

    /**
     * 绑定加数量事件
     */
    changeQuantity(e) {
        var that = this;
        const id = e.currentTarget.dataset.id;
        const index = e.currentTarget.dataset.index;
        const change = Number(e.currentTarget.dataset.change);
        let carts = this.data.carts;
        let count = carts[index].count;

        carts[index].addDisabled = false;
        carts[index].curDisabled = false;

        if (change == -1 && count <= 2) {
            carts[index].curDisabled = true;
            that.setData({
                carts: carts
            });
            if (count <= 1) {
                return
            }

        }

        if (change == 1 && count >= (carts[index].maxNum - 1)) {
            carts[index].addDisabled = true;
            that.setData({
                carts: carts
            });

            if (count >= carts[index].maxNum) {
                wx.showToast({
                    title: '数量已到极限',
                });
                return;
            }

        }

        count = count + change;
        rq({
            url: baseURL + 'shopcart/' + id + '/' + count,
            method: 'PUT',
            withoutToken: false,
            success: function (r) {
                carts[index].count = count;
                that.setData({
                    carts: carts,
                });
                that.getTotalPrice();
            }
        })
    },

    /**
     * 计算总价
     */
    getTotalPrice: function () {

        let carts = this.data.carts;                  // 获取购物车列表
        let total = 0;
        let noSelect = true;//是否一个都无选中
        let allSelected = true;
        let cNum = 0;
        for (let i = 0; i < carts.length; i++) {         // 循环列表得到每个数据
            if (carts[i].selected) {                     // 判断选中才会计算价格
                total += carts[i].count * carts[i].price;   // 所有价格加起来
                noSelect = false;
                cNum += carts[i].count;
            } else
                allSelected = false;
        }

        if (!carts.length) {
            allSelected = false;
        }

        this.setData({                                // 最后赋值到data中渲染到页面
            carts: carts,
            totalPrice: total.toFixed(2),
            noSelect: noSelect,
            selNum: cNum,
            allSelected: allSelected,
        });
    },
    /**
     * 下单
     */
    placeOrder: function () {

        //commJS.isRegister('../cart/cart', 1,true);

        let that = this;
        let cartItemIds = [];
        let carts = this.data.carts;
        let newCarts = []
        for (let i = 0; i < carts.length; i++) {
            if (carts[i].selected) {
                if (carts[i].prodStatus == '已下架') {
                    wx.showModal({
                        showCancel: false,
                        content: carts[i].produceName + '已经下架，不能下单',
                    })
                    return;
                }
                cartItemIds.push(carts[i].id);//计算选中的商品
            }
            else
                newCarts.push(carts[i]);
        }
        if (cartItemIds.length == 0)
            return;
        console.log(cartItemIds);
        rq({
            url: baseURL + 'order',
            method: 'post',
            withoutToken: false,
            data: {
                'cartIds': cartItemIds
            },
            errorcb: function (r) {
                if (r.data.meta.code == 800) {

                    /*if (!commJS.isRegister('../cart/cart', 1, true)) {
                        return;
                    }*/
                    //改为获取手机号
                    that.setData({
                        showBindPhone: true
                    });

                }
            },
            success: function (r) {

                wx.navigateTo({
                    url: '../buySuccess/buySuccess',
                    complete: function () {
                        that.setData({
                            carts: newCarts
                        });//及时更新优化体验
                    }
                })

            }
        })
    },
    /*
     显示删除按钮
    */
    delItemFn: function (e) {

        let ind = e.currentTarget.dataset.ind,
            arr = this.data.carts,
            isShow = arr[ind].isShowDel;

        if (isShow == 'show') {
            arr[ind].isShowDel = '';
        }
        else {
            arr[ind].isShowDel = 'show';
        }

        this.setData({
            carts: arr
        })

    },
    delItemFn: function (e) {

        let ind = e.currentTarget.dataset.ind,
            arr = this.data.carts,
            isShow = arr[ind].isShowDel;

        if (isShow == 'show') {
            arr[ind].isShowDel = '';
        }
        else {
            arr[ind].isShowDel = 'show';
        }

        this.setData({
            carts: arr
        })

    },
    delDataItemFn: function (e) {

        let ind = e.currentTarget.dataset.ind,
            arr = this.data.carts,
            self = this,
            id = arr[ind].id;

        function delFail() {
            wx.showToast({
                title: '删除失败',
            });
        }

        rq({
            method: 'delete',
            withoutToken: false,
            errorcb: delFail,
            url: baseURL + 'shopcart/' + id,
            success: function (r) {

                arr.splice(ind, 1);

                self.setData({
                    carts: arr
                })

                self.getTotalPrice();

            }
        })

    },
    //提示绑定手机号
    hideBindPhone: function () {
        this.setData({
            showBindPhone: false
        })
    },
    //获取绑定手机号
    getPhoneNum: function (e) {

        let self = this;
        if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
            this.hideBindPhone();
        } else {

            let data = e.detail.encryptedData,
                iv = e.detail.iv,
                self = this,
                dat = { "iv": iv, "encryptedData": data };

            sendPhoneData();

            function sendPhoneData() {
                rq({
                    method: 'put',
                    data: JSON.stringify(dat),
                    errorcb: function () {
                        wx.showModal({
                            content: '绑定失败，请重试。',
                            showCancel: false
                        });
                    },
                    //requestAgain: sendPhoneData,
                    withoutToken: false,
                    errorcb: function () {
                        app.login();
                    },
                    url: baseURL + 'getUserPhone',
                    success: function (r) {
                        wx.setStorageSync(app.globalData.needRegPhoneNumKey, true);
                        wx.showModal({
                            content: '绑定成功',
                            showCancel: false,
                            success: function (res) {
                                self.hideBindPhone();
                                self.placeOrder();
                            }
                        });

                    },
                    fail: function () {
                        wx.showModal({
                            content: '绑定失败',
                            showCancel: false,
                            success: function (res) {
                                self.hideBindPhone();
                            }
                        });
                    }
                });
            }

        }
    },

})
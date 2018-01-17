// page/component/orders/orders.js

let app = getApp(),
    rq = app.bzRequest,
    baseRqUrl = app.globalData.svr,
    commJS = require("../common/common.js");

Page({
  data:{
    orders:[],
    baseImgUrl: app.globalData.baseImgUrl
  },
  dealwithOrders : function(arr){

    if(!arr.length){
        return;
    }

    let i = arr.length,
        taltolMoney,
        temp,
        tprice,
        i2;

    for(;i--;){

        /* 统计订单价格
        taltolMoney = 0;
        temp = arr[i].items;
        i2 = temp.length;
        
        if(i2 < 1){
            continue;
        }

        for(;i2--;){
            tprice = temp[i2].price * temp[i2].count;
            taltolMoney += tprice;
        }

        arr[i]['orderMoney'] = taltolMoney;*/

        //显示状态详情
        arr[i]['statusDetail'] = {};
        arr[i]['statusDetail']['isShow'] = false;
        arr[i]['statusDetail']['info'] = [];

    }


  },  
  onReady() {

    //commJS.isRegister('../orders/orders',0);
    
    let self = this;
    rq({
        url: baseRqUrl + 'order',
        withoutToken: false,
        success : function(r){

            self.dealwithOrders(r.data.data);
        
            self.setData({
                orders : r.data.data
            })
 
        }
    })

  },
  
  onShow:function(){
   
  },
  onLoad :function(){
       
  },
  showStatusDetailFn : function(e){
      let ind = e.currentTarget.dataset.ind,
          arr = this.data.orders,  
          isShow = arr[ind].statusDetail.isShow,
          self = this; 

      if (isShow){
        arr[ind].statusDetail.isShow = false;
        this.setData({
            orders : arr
        })
      }   
      else{
  
          arr[ind].statusDetail.isShow = true;   
          rq({
              url: baseRqUrl +'orderStatus/'+arr[ind].id,
              withoutToken: false,
              success : function(r){

                arr[ind].statusDetail.info = r.data.data;
                self.setData({
                    orders: arr
                })
               
              }
            
              
          });


      } 
      
  },
  connkf : function(){
      wx.showModal({
          content: '是否拨打客服热线',
          success: function (res) {
              if (res.confirm) {
                  wx.makePhoneCall({
                      phoneNumber: app.globalData.phoneNumKf,
                  }) 
              } 
          }
      })
  }
 
})
Page({
  data: {
      url:''
  },
  onLoad:function(e){
    console.log(e)
    this.setData({
      url: e.url
    });
  }
})
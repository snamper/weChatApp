//index.js
//获取应用实例
var app = getApp()
var hasMore;
var currentPage=1;
var cat=100;
var isLoading;
var type=2;
var searchHistory;

var api = require('../../../api.js')
var Zan = require('../../../zanui/index');
var utils = require('../../../utils/util.js')

Page(Object.assign({}, Zan.Tab, {
    data: {
        inputShowed: false,
        inputVal: "",
        gridPicSize: '?imageView2/1/w/' + Math.ceil(app.globalData.system_info.windowWidth  *0.313*app.globalData.system_info.pixelRatio) + '/h/' + Math.ceil(app.globalData.system_info.windowWidth *0.313*app.globalData.system_info.pixelRatio),
    },
  showInput: function () {
      console.log(searchHistory)
    this.setData({
      inputShowed: true,
    });
    if(searchHistory.length){
      this.setData({
        searchHistory:searchHistory.reverse()
      });
    }
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false,
      searchHistory:[]
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: "",
      searchResult:[]
    });
  },
  inputTyping: function (e) {
    var that = this;
    wx.showNavigationBarLoading();
    api.zhuangxlist(100,type,currentPage,e.detail.value, function(res) {
      console.log(res)
      that.setData({
        inputVal: e.detail.value,
        searchResult: res.list
      });
      wx.hideNavigationBarLoading();
    });
  },
  select:function(e){
    if(this.data.inputVal){
      var _data = {'name':e.currentTarget.dataset.name,'avatar':e.currentTarget.dataset.avatar,'id':e.currentTarget.dataset.id,'path':e.currentTarget.dataset.path};

      if(searchHistory&&searchHistory.length<10){
        searchHistory.push(_data)
      }else if(searchHistory.length>=10){
        searchHistory[searchHistory.length-1] = _data
      }

      wx.setStorageSync('zhuangx_searchHistory',searchHistory);
    }
    this.hideInput();
    console.log(e.currentTarget.dataset.path)
    if(e.currentTarget.dataset.path){
      wx.navigateTo({
        url: e.currentTarget.dataset.path
      })
    }else{
      if(type==1){
        wx.navigateTo({
          url: "/pages/zhuangx/edit/edit?scene="+e.currentTarget.dataset.id
        })
      }else if(type==2){
        wx.navigateTo({
          url: "/pages/face/edit/edit?scene=" + e.currentTarget.dataset.id
        })
      }else{
        wx.navigateTo({
          url: "/pages/zuotu/edit/edit?scene=" + e.currentTarget.dataset.id
        })
      }
    }
  },
  onPullDownRefresh: function () {
    currentPage=1
    this.getList(cat,'');
  },
  onReachBottom: function() {
    if (!hasMore) return;
    currentPage++;
    this.getList(cat,'');
  },
  onShareAppMessage: function () {
    if(type==2) {
      return {
        title: '疯狂变脸',
        path: "/pages/index/index"
      }
    }else if(type==1){
      return {
        title: '快来装X吧',
        path: "/pages/zhuangx/list/list?type=1"
      }
    }else if(type==3){
      return {
        title: '快来做图吧',
        path: "/pages/zhuangx/list/list?type=3"
      }
    }
  },
    onShow:function (options) {

    },
    onLoad: function (options) {
      searchHistory  = wx.getStorageSync('zhuangx_searchHistory');
      if(utils.isEmptyObject(searchHistory)){
        searchHistory = []
      }

      currentPage=1;

      if(type==2){
        wx.setNavigationBarTitle({
          title: '换脸'
        });
      }else if(type==1){
        wx.setNavigationBarTitle({
          title: '做截图'
        });
      } else if(type==3){
        wx.setNavigationBarTitle({
          title: '做图'
        });
      }

      this.setData({
        type:type
      })
      isLoading = false;
      this.getList(cat,'');
    },
    selectTemplate:function (e) {
      let that = this;
      for (var k = 0; k < that.data.list.length; k++) {
        if(this.data.list[k]['id'] == e.currentTarget.id){
          if(type==1){
            /*var _content = this.data.list[k]
            console.log(_content)
            wx.setStorage({
              key:"current_zhuangx_template",
              data:_content,
              success:function () {
                wx.navigateTo({
                  url: "/pages/zhuangx/edit/edit"
                })
              }
            })*/
            if(this.data.list[k]['path']){
              wx.navigateTo({
                url: this.data.list[k]['path']
              })
            }else{
              wx.navigateTo({
                url: "/pages/zhuangx/edit/edit?scene="+e.currentTarget.id
              })
            }

          }else if(type==2){
            /*var _content = this.data.list[k]
            wx.setStorage({
              key:"current_face_template",
              data:_content,
              success:function () {
                wx.navigateTo({
                  url: "/pages/face/edit/edit"
                })
              }
            })*/
            wx.navigateTo({
              url: "/pages/face/edit/edit?scene="+e.currentTarget.id
            })
          } else if(type==3){
          /*var _content = this.data.list[k]
          wx.setStorage({
            key:"current_face_template",
            data:_content,
            success:function () {
              wx.navigateTo({
                url: "/pages/face/edit/edit"
              })
            }
          })*/
          wx.navigateTo({
            url: "/pages/zuotu/edit/edit?scene="+e.currentTarget.id
          })
        }
        }
      }
    },
    getList: function(index,search) {
        var that = this;
        if(utils.isEmptyObject(that.data.list)){that.data.list = []}
        if (isLoading) {
            return;
        } else {
            isLoading = true;
        }
        wx.showNavigationBarLoading();
      if(currentPage==1){
        wx.showToast({
          title: 'Loading……',
          duration:20000,
          icon: 'loading'
        })
      }
        api.zhuangxlist(index,type,currentPage,search, function(res) {
          console.log(res.list)
            currentPage = res.page;
            hasMore = res.pageCount > res.page;
            isLoading = false;
            res.cats.selectedId = index;
            res.cats.scroll = true;
            res.cats.height = 45;

            if(currentPage == 1){
              that.setData({
                  list: []
              })
            }
          wx.stopPullDownRefresh()
            that.setData({
                tabs:res.cats,
                list: that.data.list.concat(res.list),
                hasMore: hasMore
            })
            wx.hideToast()
            wx.hideNavigationBarLoading();
        });
    },
    onReachBottom: function() {
        if (!hasMore) return;
        currentPage++;
        this.getList(cat,'');
    },
    handleZanTabChange(e) {
        var componentId = e.componentId;
        currentPage = 1
        cat = e.selectedId;
        this.setData({
            [`${componentId}.selectedId`]: cat,
            list: null
        });
        this.getList(cat,'')
    }
}));

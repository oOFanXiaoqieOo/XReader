<template>
  <div class="ebook">
    <transition name="slide-down">
      <div v-show="isMenuShow" class="title-wrapper">
        <div class="left">
          <span class="icon-list" @click="listtoggle"></span>
        </div>
        <div class="left">
          <span class="icon-attachment" @click="marktoggle"></span>
        </div>
        <div class="left">
          <span class="icon-search"></span>
        </div>
        <div class="right">
          <div class="icon-wrapper">
            <span class="icon-star-empty" @click="addmark"></span>
          </div>
          <div class="icon-wrapper">
            <span class="icon-quill"></span>
          </div>
          <div class="icon-wrapper">
            <span class="icon-font-size" @click="themetoggle"></span>
          </div>
          <div class="icon-wrapper">
            <span class="icon-circle-left" @click="prevPage"></span>
            <span class="icon-circle-right" @click="nextPage"></span>
          </div>
        </div>
      </div>
    </transition>
    <!--<div v-show="isListShow" class="drawer-body">-->
    <mu-drawer class="toc-drawer" left :open="isListShow" :docked="true" @close="listtoggle()">
      <mu-appbar title="目录">
        <!--<mu-icon-button icon="icon-wrapper" @click="listtoggle" slot="left" />-->
      </mu-appbar>
      <mu-list>
        <!--<mu-list-item :title="item.label"-->
        <!--<mu-list-item :title="{{value}}"-->
        <!--:key="item.label"-->
        <!--@click="gotoDirectory(item)"-->
        <!--v-for="value in toc">aaaa-->
        <mu-list-item button :title="item.label" :key="item.label" v-for="item in toc" @click=gotoDirectory(item)>
          {{item.label}}
        </mu-list-item>
      </mu-list>
    </mu-drawer>
    <mu-drawer class="toc-drawer" left :open="isMarkShow" :docked="true" @close="marktoggle()">
      <mu-appbar title="书签">
      </mu-appbar>
      <mu-list>
        <mu-list-item button :title="item.id" :key="item.id" v-for="item in bookMark" @click=gotoMark(item)>
          {{item.name}}
        </mu-list-item>
      </mu-list>
    </mu-drawer>
    <mu-drawer class="theme-drawer" right :open="isThemeShow" :docked="false" @close="themetoggle()">
      <div class="lable">文本大小:
        <mu-button color="gray" @click=fontSizeAdd()>
          <i class="icon-superscript2"></i>
        </mu-button>
        <mu-button color="gray" @click=fontSizeMinus()>
          <i class="icon-subscript2"></i>
        </mu-button>
      </div>
      <div class="lable">文本间距:
        <mu-button color="gray" @click=fontHeightAdd() disable>
          <i class="icon-text-height"></i>
        </mu-button>
        <mu-button color="gray" @click=fontHeighMinus() disable>
          <i class="icon-text-height"></i>
        </mu-button>
      </div>
      <div class="lable">字体样式:
        <mu-select v-model="fontStyle.font" @change="selectFont($event)" full-width>
          <mu-option v-for="option,index in fontList" :key="option" :label="option" :value="index"></mu-option>
        </mu-select>
      </div>

      <div class="lable">页面主题:
        <mu-button v-for="item,index in themeList" :key="item.name" :label="item" color="blue" icon
                   @click="selectTheme(index)">
          {{index}}
        </mu-button>
      </div>
    </mu-drawer>
    <div class="read-wrapper">
      <div id="read" class="read"></div>
      <div class="mask">
        <div class="left" @click="prevPage"></div>
        <div class="center" @click="toggle"></div>
        <div class="right" @click="nextPage"></div>
      </div>
    </div>

    <transition name="slide-up">

      <div v-show="isMenuShow" class="menu-wrapper">
        <div class="left">
          <input class="progress"
                 type="range"
                 max="100"
                 min="0"
                 step="1"
                 @change="onProgressChange($event.target.value)"
                 @input="onProgressInput($event.target.value)"
                 :value="progress"
                 :disabled="!bookAvailable"
                 ref="progress">
        </div>
        <div class="right">
          <div class="icon-wrapper">
            <span class="icon-books" @click=booktoggle()></span>
          </div>
          <div class="icon-wrapper">
            <span class="icon-share2" @click=loadLocalBook></span>
            <span class="icon-share2" @click=loadBook></span>
          </div>
        </div>
      </div>
    </transition>
    <mu-drawer class="book-drawer" right :open="isBookShow" :docked="true" @close="booktoggle()">
      <mu-appbar title="书架">
      </mu-appbar>
      <mu-list>
        <mu-list-item button :title="item.name" :key="item.name" v-for="item in bookList" @click=openFile(item.path)>
          {{item.name}}
        </mu-list-item>
      </mu-list>
    </mu-drawer>
    <input id="fileInput" type="file" style="visibility:hidden" @onchange=addFile()>

  </div>

</template>

<script>
  import Epub from 'epubjs'
  import bookDb from './util/bookDb2'
  var BOOK_URL = ''
  global.ePub = Epub
  let g_store

  var inputObj = document.createElement('input')
  inputObj.setAttribute('id', 'fileInput');
  inputObj.setAttribute('type', 'file');
  inputObj.setAttribute("style", 'visibility:hidden');
  document.body.appendChild(inputObj);


  export default {
    data() {
      return {
        isMenuShow: false,
        isListShow: false,
        perListShow: false,
        isMarkShow: false,
        isThemeShow: false,
        isBookShow: false,
        bookAvailable: false,
        curPage: -1,
        progress: -1,
        themeID: 0,
        currentBookURL: '',
        defaultBookURL: 'static/三体.epub',
        bookName:'',//当前打开的书名
        toc: [],
        tt: -1,
        userName:'local',//默认用户名
        loginFlag:false,//登陆状态
        DB_NAME:'XReader',
        DB_OBJECT:'Book',
        bookMark: [],
        themeList: [
          {
            name: 'Default',
            style: {
              body: {
                'color': '#000',
                'background': '#fff',
              },
            }
          },
          {
            name: 'Gold',
            style: {
              body: {
                'color': '#5c5b56',
                'background': '#c6c2b6',
              },
            }
          },
          {
            name: 'Eye',
            style: {
              body: {
                'color': '#404c42',
                'background': '#a9c1a9',
              },
            }
          },
          {
            name: 'Night',
            style: {
              body: {
                'color': '#cecece',
                'background': '#000000',
              },
            }
          }
        ],
        fontStyle:
          {
            fontColor: '#000',
            fontSize: 16,
            font: 'Microsoft Yahei',
            lineHeight: 2
          },
        fontSizeLimit:
          {
            minSize: 8,
            maxSize: 38,
          },
        lineHeightLimit:
          {
            minSize: 0,
            maxSize: 10,
          },
        fontColorList: [
          {fontColor: '#000'},
          {fontColor: '#fff'}
        ],
        fontList: [
          "Microsoft YaHei",
          "Heiti SC",
          "Heiti TC"
        ],
        bookList: [
          {
            name: '空',
            path: '/',
          }
        ],
        selectBook: '',
      }
    },
    methods: {
      // 电子书解析和渲染
      init() {
        BOOK_URL = this.defaultBookURL
//        this.book.on('renderer:chapterDisplayed', () => {
//          // this.info.page = 1
//          // 创建动态脚本
//          function createScript(url) {
//            var script = document.createElement('script')
//            script.type = 'text/javascript'
//            script.src = url
//            return script
//          }
//
//          // 创建动态样式表
//          function createLink(url) {
//            var link = document.createElement('link')
//            link.rel = 'stylesheet'
//            link.type = 'text/css'
//            link.href = url
//            return link
//          }
//
//          var link = createLink('/static/epub/common.css')
//          var script = createScript('/static/epub/selection.js')
//          var iframe = document.getElementsByTagName('iframe')[0]
//          iframe.contentDocument.head.appendChild(link)
//          iframe.contentDocument.body.appendChild(script)
//
//        })
//
//
//        this.book.on('book:pageChanged', function (location) {
//          console.log(location.anchorPage, location.pageRange)
//          console.log("cccc")
//        })
//        this.book.on('renderer:locationChanged', locationCfi => {
//          this.locationCfi = locationCfi
//          console.log("cccc")
//        })
//        this.book.on('renderer:mouseup', function (event) {
//          //释放后检测用户选中的文字
//          console.log("cccc")
//          var render = this.book.renderer.render;
//          var selectedContent = render.window.getSelection();
//          self.selection = selectedContent;
//          //若当前用户不在选中状态，并且选中文字不为空
//          if (self.selected == false) {
//            if (selectedContent.toString() && (selectedContent.toString() != "")) {
//              self.selected = true;
//            }
//          }
//        });
      },
      login(account,pwd){
        //用户登陆
        this.loginFlag = true
      },
      logout(){
        //当前账户登出，清空书签和批注
        this.loginFlag = false
      },
      loadBook() {
        // 生成Ebook
        if(this.book){
          this.closeBook()
        }

        this.book = new Epub(BOOK_URL)
        this.bookName = BOOK_URL.substring(BOOK_URL.lastIndexOf('/') + 1)
        // 生成Rendition,通过Book.renderTo方法生成
        this.rendition = this.book.renderTo('read', {
          width: window.innerWidth,
          height: window.innerHeight
        })
        // 通过Rendition.display渲染电子书
        this.rendition.display()

        this.book.ready.then(() => {
          // 生成目录,获得三级目录，先这么实现，后面有时间再递归
          this.navigation = this.book.navigation
          this.navigation.toc.forEach(item => {
            this.toc.push(item)
            if (item.subitems.length) {
              item.subitems.forEach(item => {
                this.toc.push(item)
                if (item.subitems.length) {
                  item.subitems.forEach(item => {
                    this.toc.push(item)
                  })
                }
              })
            }
          })
          //console.log('aaaa', this.toc)

          // 生成Locations对象
          return this.book.locations.generate()
        }).then(result => {
          // 保存locations对象
          this.locations = this.book.locations

          // 标记电子书为解析完毕状态

          this.bookAvailable = true
        })


        //this.themes = this.rendition.themes

        this.themeList.forEach(theme => {
          this.rendition.themes.register(theme.name, theme.style)
        })
        // 设置初始字体大小
        //this.rendition.themes.register(this.fontList)
        //this.rendition.themes.font(this.fontStyle.font)
        //this.setFontSize(this.fontStyle.fontSize)


        //this.openFileIIs()
        this.curPage = -1

        this.indexDbOpen()
        this.loadBookMark()
      },
      closeBook(){
        this.book.destroy()   //关闭书本
        this.toc.length =0    //清空目录
        this.bookMark.length =0   //书签清空

      },
      indexDbOpen()
      {
        bookDb.init(() => {

        })
      },
      loadBookMark(){//加载书签
        if(this.loginFlag)
        {//从indexDB获取书签
          var index = [
            this.userName,
           this.bookName,
          ]
          console.log(index)
          bookDb.openDB(bookDb.DB_NAME,bookDb.BOOKMARK_OBJECT,1,()=>{
            //this.bookMark = JSON.parse(bookDb.getBookMark(index,null))
            var data = bookDb.getBookMark(index,(data) =>{
              this.bookMark = JSON.parse(data)
            })

          })
          console.log("aaaa",this.bookMark);
        }
        else
        {//从本地获取书签
          let t_bookMark = localStorage.getItem("<"+this.userName + "><" +this.bookName+">-BookMark")
          if(t_bookMark ===null)
          {
              //未找打则不处理
            console.log("未找到"+"<"+this.userName + "><" +this.bookName+">'s BookMark")
          }
          else{
            this.bookMark = JSON.parse(localStorage.getItem("<"+this.userName + "><" +this.bookName+">-BookMark",{}))
          }
        }
      },
      loadBookNote(){//加载批注
        if(this.loginFlag)
        {

        }
        else
        {

        }
      },
      prevPage() {
        if (this.rendition) {
          this.rendition.prev()
          if (this.curPage > 0) {
            this.curPage--;
          }
        }
      },
      nextPage() {
        if (this.rendition) {
          this.rendition.next()
          if (this.curPage < this.book.locations._locations.length) {
            this.curPage++;
          }
        }
      },
      toggle() {
        if (this.isMenuShow) {
          this.perListShow = this.isListShow
          this.isListShow = false
        }
        else {
          this.isListShow = this.perListShow
        }
        this.isMenuShow = !this.isMenuShow
        this.isMarkShow = false
        this.isThemeShow = false
        this.isBookShow = false
      },
      listtoggle() {
        this.isListShow = !this.isListShow
        this.perListShow = this.isListShow
        this.isMarkShow = false
      },
      marktoggle() {
        this.isMarkShow = !this.isMarkShow
        this.isListShow = false
      },
      themetoggle() {
        this.isThemeShow = !this.isThemeShow
      },
      booktoggle() {
        this.isBookShow = !this.isBookShow
      },
      gotoDirectory(item) {
        this.open = false
        //this.book.goto(item.href)
        this.rendition.display(item.href)
      },
      addmark() {
        this.bookMark.unshift({
          id: '' + new Date().getTime(), // TODO
          cfi: this.rendition.currentLocation().start.cfi,
          name: "书签[" + this.curPage + "]", // TODO
          createTime: new Date().getTime(),
          posY: 1 // TODO
        })
        //console.log("bbbb", this.bookMark)
        if(this.loginFlag)
        {//登陆，存储到indexDB数据库
          var value = {
            'UserName': this.userName,
            'BookName': this.bookName,
            'index':[this.userName,this.bookName],
            'BookMark': JSON.stringify(this.bookMark)
          }
          bookDb.openDB(bookDb.DB_NAME,bookDb.BOOKMARK_OBJECT,0,()=>{
            bookDb.addBookMark(value,null)
          })
        }
        else
        {//未登陆存储至本地
          localStorage.setItem("<"+this.userName + "><" +this.bookName+">-BookMark",JSON.stringify(this.bookMark))
        }
      },
      gotoMark(item) {
        this.open = false
        //this.book.goto(item.href)
        this.rendition.display(item.cfi)
      },
      initEvent() {
        console.log('初始化事件')
        document.addEventListener('keydown', this.onKeyDown = e => {
          console.log(e.keyCode)
          switch (e.keyCode) {
            case 27: // Esc
              this.$router.push('/')
              break
            case 37: // left
            case 38: // up
              this.prevPage()
              break
            case 39: // right
            case 40: // down
              this.nextPage()
              break
          }
        }, false)
      },
      setFontSize(fontSize) {
        this.rendition.themes.fontSize(fontSize + 'px');
        console.log(fontSize)
      },
      fontSizeAdd() {
        this.fontStyle.fontSize++
        //console.log(this.fontStyle.fontSize)
        this.setFontSize(this.fontStyle.fontSize)
      },
      fontSizeMinus() {
        this.fontStyle.fontSize--
        //console.log(this.fontStyle.fontSize)
        this.setFontSize(this.fontStyle.fontSize)
      },
      fontHeightAdd() {
        this.fontStyle.lineHeight++

      },
      fontHeighMinus() {
        this.fontStyle.lineHeight--
      },
      selectFont(id) {
        this.fontStyle.font = this.fontList[id]
        this.rendition.themes.font(this.fontStyle.font)
        //this.rendition.themes.select(this.themeList[id].name)
      },
      selectTheme(id) {
        // this.fontStyle.font = this.fontList[id]
        //this.rendition.themes.font(this.fontStyle.font)
        this.rendition.themes.select(this.themeList[id].name)
      },
      test() {
        this.rendition.display(this.book.locations._locations[this.tt])
        this.tt++
      },
      getMyToc(item) {
        if (item.subitems.length) {
          item.subitems.forEach(item => {
            this.toc.push(item)
            getMyToc(item)
          })
        }
      },
      openFile(item) {
        inputObj.click()
        this.selectBook = document.getElementById('fileInput')
        console.log("cccc", this.selectBook.value)
        //tt.click()
        //tt.submit()
      },
      loadLocalBook() {
        BOOK_URL = 'static/木小瓜的简历.epub'
        var path = require("path");
        var fs = require("fs");
        var path ='E:/'
        fs.readdir(path, function (err, files) {
          var dirs = [];
          (function iterator(i) {
            if (i == files.length) {
              console.log(dirs);
              return;
            }
            fs.stat(path.join(pathName, files[i]), function (err, data) {
              if (data.isFile()) {
                dirs.push(files[i]);
              }
              iterator(i + 1);
            });
          })(0);
        });
      },
      addFile() {
        inputObj.click()
        var name = document.getElementById('fileInput').value
        console.log("cccc", name)
        if (name.length > 0) {
          var file_ext = name.substring(name.lastIndexOf(".") + 1);
          if (file_ext == "epub") {
            this.bookList.push({
              name: name,
              path: name,
            })
          }
          else {
            alert("文件格式不正确。请选择epub文件");
            return;
          }
        }
        console.log("bbbbb", this.bookList)
      },
      getPath(obj) {
        if (obj) {

          if (window.navigator.userAgent.indexOf("MSIE") >= 1) {
            console.log("IE")
            obj.select();

            return document.selection.createRange().text;
          }

          else if (window.navigator.userAgent.indexOf("Firefox") >= 1) {
            console.log("FF")
            if (obj.files) {

              return obj.files.item(0).getAsDataURL();
            }
            return obj.value;
          }
          return obj.value;
        }
      },
      openFileIIs() {
        try {
          var fso = new ActiveXObject("Scripting.FileSystemObject");
          var s = fso.GetFolder("E:\\");
          var fn = new Enumerator(s.files);
          var s = "";
          for (; !fn.atEnd(); fn.moveNext()) {
            s = s + fn.item() + "\n";
          }
          this.bookList.push(s);
        } catch (e) {
          console.log(e)
        }
      },
      onProgressChange(progress) {
        const percentage = progress / 100
        const location = percentage > 0 ? this.locations.cfiFromPercentage(percentage) : 0
        this.rendition.display(location)
      },
      onProgressInput(progress) {
        const percentage = progress / 100
        const location = percentage > 0 ? this.locations.cfiFromPercentage(percentage) : 0
        this.rendition.display(location)

      },
    },


    mounted() {
      this.init()
      this.loadBook()
      this.initEvent()
    },
    destroyed() {
      this.book && this.book.destroy()
      document.removeEventListener('keydown', this.onKeyDown)
    },
  }
</script>

<style lang="scss" scoped>
  @import "./assets/styles/global";

  .ebook {
    position: relative;
    overflow-y: hidden;
    .title-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: px2rem(30);
      z-index: 101;
      background-color: #fff;
      box-shadow: 0 px2rem(8) px2rem(8) rgba(0, 0, 0, 0.5);
      &.slide-down-enter, &.slide-down-leave-to {
        transform: translate3d(0, -100%, 0);
      }
      &.slide-down-enter-to, &.slide-down-leave {
        transform: translate3d(0, 0, 0);
      }
      &.slide-down-enter-active, &.slide-down-leave-active {
        transition: all .3s linear;
      }
      .left {
        flex: 0 0 px2rem(60);
        @include center;
      }
      .right {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        .icon-wrapper {
          flex: 0 0 px2rem(40);
          @include center;
        }
      }
    }
    .read-wrapper {
      .read {

      }
      .mask {
        display: flex;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 50;
        .left {
           width: px2rem(100)
         }
        .right {
          width: px2rem(100)
        }
        .center {
          flex: 1;
        }
      }
    }
    .menu-wrapper {
      display: flex;
      position: absolute;
      z-index: 99;
      left: 0;
      bottom: 0;
      width: 100%;
      height: px2rem(30);
      box-shadow: 0 px2rem(-8) px2rem(8) rgba(0, 0, 0, 0.15);
      background-color: #fff;
      .left {
        flex: 0 0 px2rem(60);
        @include center;
      }
      .right {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        .icon-wrapper {
          flex: 0 0 px2rem(40);
          @include center;
        }
      }
    }
  }

  //目录
  .toc-drawer {
    position: absolute;
    top: px2rem(30);
    width: 300px;
    max-width: 100%;
    background-color: #fff;
    z-index: 100;
  }

  .drawer-body {
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
    .mu-item-title {
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  //主题设置
  .theme-drawer {
    position: absolute;
    top: px2rem(30);
    width: 300px;
    max-width: 100%;
    height: 300px;
    background-color: #fff;
    z-index: 100;
    .lable {
      position: relative;
      padding: 2px 2px 20px 2px;
      font-size: 20px;
    }
    .active {

    }
    .disable {
      disable: true;
    }
  }

  //书架信息
  .book-drawer {
    position: absolute;
    //top:50%;
    top: px2rem(30);
    width: 300px;
    max-width: 100%;
    background-color: #fff;
    z-index: 98;
  }
</style>

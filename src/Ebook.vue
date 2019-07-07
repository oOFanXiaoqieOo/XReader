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
        <div class ="left">
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
            <span class="icon-share2" @click=test()></span>
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
  </div>
</template>

<script>
  import Epub from 'epubjs'

  const DOWNLOAD_URL = 'static/三体.epub'
  global.ePub = Epub

  //const Epub = window.ePub
  const EPUBJS = window.EPUBJS
  //const QiuPen = window.QiuPen


  export default {
    data() {
      return {
        isMenuShow: false,
        isListShow: false,
        perListShow: false,
        isMarkShow: false,
        isThemeShow: false,
        isBookShow: false,
        bookAvailable:false,
        curPage: -1,
        progress:-1,
        themeID: 0,
        toc: [],
        tt: -1,
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
        ]
      }
    },
    methods: {
      // 电子书解析和渲染
      init() {
        this.book.on('renderer:chapterDisplayed', () => {
          // this.info.page = 1
          // 创建动态脚本
          function createScript(url) {
            var script = document.createElement('script')
            script.type = 'text/javascript'
            script.src = url
            return script
          }

          // 创建动态样式表
          function createLink(url) {
            var link = document.createElement('link')
            link.rel = 'stylesheet'
            link.type = 'text/css'
            link.href = url
            return link
          }

          var link = createLink('/static/epub/common.css')
          var script = createScript('/static/epub/selection.js')
          var iframe = document.getElementsByTagName('iframe')[0]
          iframe.contentDocument.head.appendChild(link)
          iframe.contentDocument.body.appendChild(script)

        })


        this.book.on('book:pageChanged', function (location) {
          console.log(location.anchorPage, location.pageRange)
          console.log("cccc")
        })
        this.book.on('renderer:locationChanged', locationCfi => {
          this.locationCfi = locationCfi
          console.log("cccc")
        })
        this.book.on('renderer:mouseup', function (event) {
          //释放后检测用户选中的文字
          console.log("cccc")
          var render = this.book.renderer.render;
          var selectedContent = render.window.getSelection();
          self.selection = selectedContent;
          //若当前用户不在选中状态，并且选中文字不为空
          if (self.selected == false) {
            if (selectedContent.toString() && (selectedContent.toString() != "")) {
              self.selected = true;
            }
          }
        });
      },
      showEpub() {
        // 生成Ebook
        this.book = new Epub(DOWNLOAD_URL)
        console.log(this.book)
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
          bookAvailable = this.bookAvailable
        })


        //this.themes = this.rendition.themes

        this.themeList.forEach(theme => {
          this.rendition.themes.register(theme.name, theme.style)
        })
        // 设置初始字体大小
        //this.setFontSize(this.fontStyle.fontSize)


        //this.openFileIIs()
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
          cfi: this.currentLocationCfi,
          name: "书签[" + this.curPage + "]", // TODO
          createTime: new Date().getTime(),
          posY: 1 // TODO
        })
        console.log("bbbb", this.bookMark)
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
      openFile() {
//        var inputObj = document.createElement('input')
//        inputObj.setAttribute('name', 'filename')
//        inputObj.click()
//        inputObj.value
//
//        //this.bookList.push(inputObj.value)


        var selectedFile = document.getElementById('files').files[0];
        var name = selectedFile.name;//读取选中文件的文件名
        var size = selectedFile.size;//读取选中文件的大小
        console.log("文件名:" + name + "大小:" + size);
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
    },

    onProgressChange(progress) {
      const percentage = progress / 100
      const location = percentage > 0 ? this.locations.cfiFromPercentage(percentage) : 0
      this.rendition.display(location)
    },
    mounted() {
      this.showEpub()
      //this.init()
      this.initEvent()
    }
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

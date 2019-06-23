<template>
  <div class="ebook">
    <transition name="slide-down">
      <div v-show="isMenuShow" class="title-wrapper">
        <div class="left">
          <span class="icon-list"></span>
        </div>
        <div class="left">
          <span class="icon-attachment"></span>
        </div>
        <div class="left">
          <span class="icon-search"></span>
        </div>
        <div class="right">
          <div class="icon-wrapper">
            <span class="icon-star-empty"></span>
          </div>
          <div class="icon-wrapper">
            <span class="icon-quill"></span>
          </div>
          <div class="icon-wrapper">
            <span class="icon-font-size"></span>
          </div>
            <span class="icon-circle-left" @click="prevPage"></span>
            <span class="icon-circle-right" @click="nextPage"></span>
        </div>
      </div>
    </transition>
    <div class="read-wrapper">
      <div id="read" class="read"></div>
      <div class="mask">
        <div class="left" @click="prevPage"></div>
        <div class="center" @click="toggle"></div>
        <div class="right" @click="nextPage"></div>
      </div>
    </div>
    <!--<menu-bar ref="meunbar"-->
              <!--:ifTitleAndMenuShow="ifTitleAndMenuShow"-->
              <!--:fontSizeList="fontSizeList"-->
              <!--:defaultFontSize="defaultFontSize"-->
              <!--:themeList="themeList"-->
              <!--&gt;</menu-bar>-->
    <transition name="slide-up">
      <div v-show="isMenuShow" class="menu-wrapper">
        <div class="left">
          <span class="icon-books"></span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  import Epub from 'epubjs'

  const DOWNLOAD_URL = 'static/三体.epub'
  global.ePub = Epub
  export default {
    data () {
      return {
        isMenuShow: false
      }
    },
    methods: {
      // 电子书解析和渲染
      showEpub () {
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

        //this.themes = this.rendition.themes
        // 设置初始字体大小
        //this.changeFontSize(this.defaultFontSize)

      },
      prevPage () {
        if (this.rendition) {
          this.rendition.prev()
        }
      },
      nextPage () {
        if (this.rendition) {
          this.rendition.next()
        }
      },
      toggle () {
        this.isMenuShow = !this.isMenuShow
      },
      changeFontSize (fontSize) {
        this.defaultFontSize = fontSize
        if (this.themes) {
          this.themes.fontSize(fontSize)
        }
      }
    },
    mounted () {
      this.showEpub()
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
      height: px2rem(48);
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
        z-index: 100;
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
      z-index: 101;
      left: 0;
      bottom: 0;
      width: 100%;
      height: px2rem(48);
      box-shadow: 0 px2rem(-8) px2rem(8) rgba(0, 0, 0, 0.15);
      background-color: #fff;
      .icon-wrapper {
        flex: 1;
        @include center
      }
    }
  }
</style>

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import './assets/styles/icon.css'
Vue.config.productionTip = false
import EBook from './Ebook.vue'
/* eslint-disable no-new */
new Vue({
  el: '#ebook',
  router,
  components: { EBook },
  template: '<EBook/>'
})

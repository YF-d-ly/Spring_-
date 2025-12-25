// src/main.js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './stores'

// 引入 Element UI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)
Vue.config.productionTip = false

// 初始化主题
store.dispatch('theme/initTheme')

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
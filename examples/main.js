import Vue from 'vue';
import Components from "../src/components";
import App from './App.vue';

Vue.config.productionTip = false
Vue.use(Components);

new Vue({
  render: h => h(App)
  // render: h => h()
}).$mount('#app')

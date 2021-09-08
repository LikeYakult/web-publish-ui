import Vue from 'vue';
import Components from "../src/components";

Vue.config.productionTip = false
Vue.use(Components);

new Vue({
  render: h => h()
}).$mount('#app')

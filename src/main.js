import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import less from "less";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import * as echarts from "echarts";

Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.use(less);
Vue.prototype.$echarts = echarts;

// pro
// Vue.prototype.serverURL = "http://47.96.137.124:8000";

// dev
Vue.prototype.serverURL = "http://127.0.0.1:8000";

new Vue({
  el: "#app",
  render: (h) => h(App),
  router,
  store,
  components: {
    App,
  },
  template: "<App/>",
  beforeCreate() {
    Vue.prototype.$bus = this; //安装全局事件总线
  },
}).$mount("#app");

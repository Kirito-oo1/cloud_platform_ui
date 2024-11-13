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
// Vue.prototype.layerServerURL = '';
// Vue.prototype.serverURL = '';
// Vue.prototype.unifyLoginServerUrl = '';
// Vue.prototype.webPath = '';
// Vue.prototype.clientId = "";
// Vue.prototype.clientSecret = "";

// dev
Vue.prototype.serverURL = "http://127.0.0.1:8000";
// Vue.prototype.unifyLoginServerUrl = 'http://localhost:9999';
// Vue.prototype.webPath = 'http://localhost:8083';
// Vue.prototype.clientId = "nodeFPqz0FlF7V39bvKvzuuico";
// Vue.prototype.clientSecret = "402_aV33P3532483jQ266LQR753K7AeA6nP1RK2ij6SS75Sj0BP936XKRK4k0r33";

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

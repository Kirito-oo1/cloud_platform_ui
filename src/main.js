import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import less from "less";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.use(less);

// // pro
// Vue.prototype.layerServerURL = 'https://geo.gem-flower.com/geoserver/';
// Vue.prototype.serverURL = 'https://gis.gem-flower.com/bsh-api';
// Vue.prototype.unifyLoginServerUrl = 'https://gis.gem-flower.com/bsh-unify-api';
// Vue.prototype.webPath = 'https://gis.gem-flower.com/bsh-visual-ui';
// Vue.prototype.clientId = "nodetfoVTZlBuMcCicEJRLNQco";
// Vue.prototype.clientSecret = "_M06v344_55Ni723a6S3U4B0607X13127H6-335257S232550w72H5ca4p4587T4T";

// test
// Vue.prototype.layerServerURL = 'http://222.91.162.78:8086/geoserver/';
// Vue.prototype.serverURL = 'http://222.91.162.78:8086/bsh-api';
// Vue.prototype.unifyLoginServerUrl = 'http://222.91.162.78:8086/bsh-unify-api';
// Vue.prototype.webPath = 'http://222.91.162.78:8086/bsh-visual-ui';
// Vue.prototype.clientId = "nodexZl0SqxSZzdBv5Mun4ipco";
// Vue.prototype.clientSecret = "_d069f21A3J9o33UT276-VC2d23o146us16Kb1Kb632w3rIkJ15f1606486170p7";

// dev
// Vue.prototype.serverURL = 'http://192.168.128.90:8890';
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

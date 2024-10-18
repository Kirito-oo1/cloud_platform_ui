import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store/index";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import less from "less";
import mitt from "mitt";

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(store);
app.use(router);
app.use(ElementPlus);
app.use(less);
app.config.globalProperties.$bus = mitt();
app.mount("#app");

//环境配置
// pro
// app.config.globalProperties.serverURL = 'https://gis.gem-flower.com/bsh-api';
// test
// app.config.globalProperties.serverURL = 'http://192.168.128.90:8890';
// dev
app.config.globalProperties.serverURL = "http://localhost:8080";

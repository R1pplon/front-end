import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
import router from "./router";
import "./assets/global.css";
import hljs from "highlight.js";

// highlight.js 样式将通过动态主题系统加载
// 不再在这里静态导入主题

// 将 hljs 暴露到全局对象，供主题切换使用
window.hljs = hljs;

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(ElementPlus);

app.mount("#app");

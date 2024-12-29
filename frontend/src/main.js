import Vue from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import vuetify from './plugins/vuetify';
import Toast from 'vue-toastification';
import 'vuetify/dist/vuetify.min.css';
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";

Vue.config.productionTip = false;

// Toast 配置
const options = {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: "button",
  icon: true,
  rtl: false
};

// 使用 Vue 2 的方式注册插件
Vue.use(Toast, options);

// 配置 axios
axios.defaults.baseURL = process.env.NODE_ENV === 'production' 
  ? '' // 生产环境使用相对路径
  : 'http://localhost:3000'; // 开发环境指向后端服务
axios.defaults.timeout = 5000;
Vue.prototype.$axios = axios;

// 添加请求拦截器
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response?.status === 401) {
    // 如果是认证错误，清除token并跳转到登录页
    localStorage.removeItem('token');
    router.push('/login');
  }
  return Promise.reject(error);
});

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app'); 
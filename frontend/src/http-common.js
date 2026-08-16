import axios from "axios";
import store from "./store"
import router from './router'
import VueSimpleAlert from "vue-simple-alert";

const token = store.state.activeUser.accessToken;

const http = axios.create({
  baseURL: process.env.VUE_APP_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-type": "application/json",
    "Accept": "application/json",
    "x-access-token": token
  }
});

http.interceptors.request.use (
  function (config) {
    const token = store.state.activeUser.accessToken;
    if (token) config.headers = {
      "Content-type": "application/json",
      "Accept": "application/json",
      "x-access-token": token
    };

    return config;
  },
  function (error) {
    return Promise.reject (error);
  }
);

http.interceptors.response.use((response) => {
  return response
}, function (error) {
  if (error.response && error.response.status === 401) {
    router.push('/login');
  } else {
    VueSimpleAlert.alert("HTTP Request Error.");
    router.push('/');
  }
  return Promise.reject(error);
})

export default http;
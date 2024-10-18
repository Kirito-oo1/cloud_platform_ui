import { createStore } from "vuex";

import getters from "./getters";
import mutations from "./mutations";
import actions from "./actions";

//vuex配置
export default createStore({
  state: {
    example: 1,
  },
  modules: {},
  // getters,
  getters: {
    getExample(state) {
      return state.example > 1 ? state.example : "error";
    },
  },
  // mutations,
  mutations: {
    addExample(state) {
      return state.example++;
    },
  },
  //actions, //异步操作
  // actions: {
  //   asyncAddExample(commit) {
  //     axios.get("").then((res) => {
  //       commit("addExample", res.data);
  //     });
  //   },
  // },
});

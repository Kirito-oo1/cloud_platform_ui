import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import mutations from "./mutations";
import getters from "./getters";
import actions from "./actions";

import multiInput from "@/store/multiInput";
import worker from "@/store/worker";
import settings from "@/store/settings";

Vue.use(Vuex);

export default new Vuex.Store({
  state,

  mutations: mutations,

  getters: getters,

  actions: actions,

  modules: {
    worker,
    multiInput,
    settings,
  },
});

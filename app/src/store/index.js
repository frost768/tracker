import Vue from 'vue'
import Vuex from 'vuex'
import usersStore from './user/usersStore';
import dashboardStore from './dashboardStore';
import authStore from './authStore';
Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    usersStore,
    dashboardStore,
    authStore
  }
})

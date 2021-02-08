import Vue from 'vue'
import Vuex from 'vuex'
import usersStore from './user/usersStore';
Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    usersStore,
  }
})

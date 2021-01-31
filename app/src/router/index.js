import Vue from 'vue'
import VueRouter from 'vue-router'
import DashBoard from '../views/DashBoard.vue'
import UserPage from '../views/UserPage.vue'
Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashBoard
  },
  {
    path: '/user/:id',
    name: 'UserPage',
    component: UserPage
  }
]

const router = new VueRouter({
  routes
})

export default router

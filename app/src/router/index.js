import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store/index'
import DashBoard from '../views/DashBoard.vue'
import Login from '../views/Login.vue'
import UserPage from '../views/UserPage.vue'
Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'DashBoard',
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

router.beforeEach((to, from, next) => {
  if(!store.getters.connected && to.path !== '/') next({ name: 'Login' });
  else next();
});
export default router

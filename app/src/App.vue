<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <UserList />
    </v-navigation-drawer>

    <v-app-bar color="green" app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer">
        <v-icon>mdi-format-list-bulleted</v-icon>
      </v-app-bar-nav-icon>
      <v-app-bar-title color="white"></v-app-bar-title>
    </v-app-bar>

    <v-main>
      <router-view :key="$route.fullPath" />
    </v-main>

    <v-footer app>

    </v-footer>
  </v-app>
</template>

<script>
import UserList from './components/UserList.vue';
import store from './store/index';
import { ip } from './services/httpClient';
export default {
  name: 'App',
  components: {
    UserList,
  },
  data() {
    return {
      drawer: false,
    };
  },
  created() {
    // store.dispatch('fetchUsers').then(() => {
    //   store.dispatch('fetchOnline');
    // });
    const ws = new WebSocket(`ws://${ip}:9002`);
    ws.onmessage = function (event) {
      const response = JSON.parse(event.data);
      if (response.type === 'qr' && response.data) {
        store.commit('setQR', response.data);
      }
    }
    ws.onerror = (err) => {
      console.log(err);
    }
    ws.onopen = () => {
      console.log('Connected');
      ws.send('getQR');
    };
  }
};
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}
</style>

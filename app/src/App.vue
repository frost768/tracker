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
import router from './router/index';
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
  methods: {
    connectToWebSocket() {
      const ws = new WebSocket(`ws://${ip}:9001`);
      ws.onmessage = function (event) {
        const response = JSON.parse(event.data);
        if (response.type === 'qr' && response.data) {
          store.commit('setQR', response.data);
        }
        if (response.type === 'connection-opened') {
          store.commit('setConnected', true);
          router.replace('/dashboard');
        }
        if (response.type === 'connection-closed') {
          store.commit('setConnected', false);
          router.replace('/');
        }
        if(response.type === 'presence-update' && store.getters.users.length > 0) {
          store.commit('setOnline', response.data);
        }
        if(response.type === 'cmd-output') {
          const request = JSON.stringify({ type: 'cmd-profilePictureUrl', data: { jid: 9 }});
          ws.send(request);
        }
      };
      ws.onerror = () => {
        console.log('error');
      }
      ws.onclose = () => {
        console.log('closed');
      }
      ws.onopen = () => {
        console.log('opened');
        ws.send(JSON.stringify({ type: 'getQR' }));
      };
    }
  },
  created() {
    // store.dispatch('fetchUsers').then(() => {
    //   store.dispatch('fetchOnline');
    // });
    this.connectToWebSocket();

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

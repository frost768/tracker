<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
        <UserList />
    </v-navigation-drawer>

    <v-app-bar
     color="green"
     app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title color="white">WhatsApp Tracker</v-app-bar-title>
    </v-app-bar>

    <!-- Sizes your content based upon application components -->
    <v-main>
      <router-view :key="$route.fullPath"/>
    </v-main>

    <v-footer app>
      <!-- -->
    </v-footer>
  </v-app>
</template>

<script>
import UserList from './components/UserList.vue';

export default {
  name: "App",
  components: {
    UserList,
  },
  data(){
    return {
      drawer:false,
    }
  },
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

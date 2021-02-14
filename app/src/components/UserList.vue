<template>
  <div>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="title"> 
          <router-link to="/">Dashboard ({{ users.filter(x=> x.online).length }})</router-link>  
          </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-divider></v-divider>
    <v-list dense nav>
      <v-list-item v-for="user in users" :key="user.id">
        <DBRecords :user="user" />
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import store from '../store/index';
import DBRecords from './DBRecords.vue';
export default {
  name: "UserList",
  props: {},
  components: {
    DBRecords,
  },
  created(){
    this.ws = new WebSocket('ws://192.168.1.35:8081');
    store.dispatch("fetchUsers").then(()=>{
      store.dispatch('fetchOnline').then(()=> {
      this.ws.onmessage = function(data) {
        store.commit('setOnline',JSON.parse(data.data));
      }
      })
    })
    
    this.ws.onopen= ()=>{
      console.log('Connected');
    };
  },

  computed: {
    users(){
      return store.getters.users;
    }
  },

  methods: {
    ...mapActions(["fetchUsers", "fetchOnline"]),
    
  },
};
</script>


<style scoped>
b-list-group {
  margin-bottom: 10px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>

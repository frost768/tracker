<template>
  <router-link :to="{ path: '/user/'+user.id }">
    <v-list-item-avatar>
      <v-img v-if="user.pp!='./img_avatar5.png'" :src="user.pp"></v-img>
      <v-img v-else src="@/assets/img_avatar5.png" alt=""></v-img>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title> {{ user.name }}</v-list-item-title>
      <v-list-item-subtitle><v-chip v-if="user.online" color="green">{{ user.times }}</v-chip></v-list-item-subtitle>
    </v-list-item-content>
  </router-link>
</template>

<script>
export default {
  name: "DBRecords",
  props: {
    user: {},
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

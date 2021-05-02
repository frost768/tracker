<template>
  <div>
    <v-list-item-avatar tile>
      <v-img v-if="user.pp != './img_avatar5.png'" :src="user.pp"></v-img>
      <v-img v-else src="@/assets/logo.png"></v-img>
    </v-list-item-avatar>
    <router-link :to="{ path: '/user/' + user.id }">
      {{ user.name.length > 5 ? user.name.substr(0, 5) : user.name }}
      <v-chip v-if="user.online">{{ user.times }}</v-chip>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'DBRecord',
  props: {
    user: {},
  },
};
</script>
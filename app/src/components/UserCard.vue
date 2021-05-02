<template>
  <div>
    <v-card class="mx-auto">
      <v-img v-if="user.pp != './img_avatar5.png'" :src="user.pp"></v-img>
      <v-img v-else src="@/assets/logo.png"></v-img>
      <v-card-title>{{ user.name }}</v-card-title>
      <v-card-subtitle>
        <div v-if="user.analysis != null">
          Son görülme: {{ user.lastSeen }}<br />
          En uzun oturum:{{ Math.floor(user.analysis.longestSession.duration / 60) }} dakika<br />
          {{ user.analysis.longestSession.day }}<br />
          Toplam harcanan zaman: {{ Math.floor(user.analysis.totalTime / 3600) }} saat <br />
          Kullanım yüzdesi: %{{ Math.floor(user.analysis.usagePercent) }}
        </div>
        <v-progress-linear
          v-else
          indeterminate
          height="5"
          color="green darken-2"
        ></v-progress-linear>
      </v-card-subtitle>
    </v-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'UserCard',

  computed: {
    ...mapGetters(['user']),
  },
  created() {
    this.$store.dispatch('fetchUser', this.$route.params.id);
  },
};
</script>
<template>
  <div>
    <v-card class="mx-auto">
      <template slot="progress">
        <v-progress-linear
          color="green"
          height="10"
          indeterminate
        ></v-progress-linear>
      </template>
      <v-img v-if="user.pp != './logo.png'" :src="user.pp"></v-img>
      <v-img v-else src="@/assets/logo.png" alt=""></v-img>
      <v-card-title>{{ user.name }}</v-card-title>
      {{ user.times }}
      <v-card-subtitle v-if="user.analysis != null">
        Son görülme: {{ user.lastSeen }}<br />
        En uzun oturum:{{ Math.floor(user.analysis.longestSession.duration / 60) }} dakika<br />
        {{ user.analysis.longestSession.day }}<br />
        Toplam harcanan zaman:
        <v-chip
          :color="Math.floor(user.analysis.totalTime / 3600) > 300 ? 'red' : 'green'"
          >{{ Math.floor(user.analysis.totalTime / 3600) }}</v-chip
        >
        saat <br />
        Kullanım yüzdesi: % {{ Math.floor(user.analysis.usagePercent) }}
      </v-card-subtitle>
    </v-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: "UserCard",

  data() {
    return {
      compareLoad: false,
    };
  },

  computed: {
    ...mapGetters(['user']),
  },

  created() {
     this.$store.dispatch("fetchUser", this.$route.params.id)
  },
};
</script>
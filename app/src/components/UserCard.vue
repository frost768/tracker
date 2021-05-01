<template>
  <div>
    <v-card class="mx-auto">
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title mb-1">{{
            user.name
          }}</v-list-item-title>
          <div v-if="user.analysis != null">
            Son görülme: {{ user.lastSeen }}<br />
            En uzun oturum:{{
              Math.floor(user.analysis.longestSession.duration / 60)
            }}
            dakika<br />
            {{ user.analysis.longestSession.day }}<br />
            Toplam harcanan zaman:
            <v-chip
              :color="
                Math.floor(user.analysis.totalTime / 3600) > 300
                  ? 'red'
                  : 'green'
              "
              >{{ Math.floor(user.analysis.totalTime / 3600) }}</v-chip
            >
            saat <br />
            Kullanım yüzdesi: %
            {{ Math.floor(user.analysis.usagePercent) }}
          </div>
          <v-progress-linear
            v-else
            indeterminate
            height="20"
            color="green darken-2"
          ></v-progress-linear>
        </v-list-item-content>

        <v-list-item-avatar tile size="300" color="grey">
          <v-img v-if="user.pp != './logo.png'" :src="user.pp"></v-img>
          <v-img v-else src="@/assets/logo.png" alt=""></v-img
        ></v-list-item-avatar>
      </v-list-item>
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
<template>
  <div>
    <v-row>
      <v-col lg="2" md="4" cols="12">
        <user-card></user-card>
      </v-col>
      <v-col lg="10" md="8" cols="12">
        <v-tabs>
          <v-tab>İstatistikler</v-tab>
          <v-tab-item v-if="analysis">
            <v-row>
              <v-col md="6" lg="6" cols="12">
                <v-card v-if="sessions">
                  <v-card-title>Oturumlar</v-card-title>
                  <chart
                    :type="'scatter'"
                    :options="sessions.options.opt"
                    :series="sessions.options.series"
                  ></chart>
                </v-card>
              </v-col>
              <v-col md="6" lg="6" cols="12">
                <v-card>
                  <v-card-title>Günlük Kullanım</v-card-title>
                  <chart
                    type="line"
                    :options="analysis.dailyUsage.options.opt"
                    :series="analysis.dailyUsage.options.opt.series"
                  ></chart>
                  
                </v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col md="6" lg="6" cols="12">
                <v-card>
                  <v-card-title>Saat Sıklıkları</v-card-title>
                  <chart
                    :type="'pie'"
                    :options="analysis.timeFrequency.hour_frequencies.options"
                    :series="analysis.timeFrequency.hour_frequencies.options.series"
                  ></chart>
                </v-card>
              </v-col>
            </v-row>
          </v-tab-item>
         <v-tab>Karşılaştırma</v-tab>
         <v-tab-item>
          <div 
          v-for="user in users"
          :key="user.id" 
          >
          <v-card>
            <v-card-title>{{ user.name }}</v-card-title>
          </v-card>
            
          </div>
         </v-tab-item>
        </v-tabs>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import UserCard from '../components/UserCard.vue';
import { mapGetters } from 'vuex';
import Chart from '../components/Chart.vue';
export default {
  name: 'UserPage',
  components: {
    UserCard,
    Chart,
  },
  computed: {
    ...mapGetters(['sessions', 'analysis', 'users']),
  },
  mounted() {
    this.$store.dispatch('fetchUserSessions', this.$route.params.id);
    this.$store.dispatch('fetchUserAnalysis', this.$route.params.id);
  },
};
</script>
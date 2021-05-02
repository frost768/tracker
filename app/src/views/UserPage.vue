<template>
  <v-row>
    <v-col lg="2">
      <user-card></user-card>
    </v-col>

    <v-col lg="10" md="8" cols="12">
      <v-tabs>
        <v-tab>İstatistikler</v-tab>
        <v-tab-item v-if="analysis">
          <v-row>
            <v-col md="12" lg="6" cols="12">
              <v-row>
                <v-col cols="4" sm="4" md="4">
                  <v-menu
                    v-model="dtFromMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="dtFrom"
                        label="Başlangıç"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="dtFrom"
                      @input="dtFromMenu = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="4" sm="4" md="4">
                  <v-menu
                    v-model="dtToMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="dtTo"
                        label="Bitiş"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="dtTo"
                      @input="dtToMenu = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="4" md="4"
                  ><v-btn @click="filterSessions">Filtrele</v-btn></v-col
                >
              </v-row>
              <v-card v-if="sessions">
                <v-card-title>Oturumlar</v-card-title>
                <chart :type="'scatter'" :options="sessions.options"></chart>
              </v-card>
            </v-col>
            <v-col md="12" lg="6" cols="12">
              <v-card>
                <v-card-title>Günlük Kullanım</v-card-title>
                <chart
                  type="line"
                  :options="analysis.dailyUsage.options"
                ></chart>
              </v-card>
            </v-col>
          </v-row>
          <v-row>
            <v-col md="12" lg="6" cols="12">
              <v-card>
                <v-card-title>Saat Sıklıkları</v-card-title>
                <chart
                  :type="'line'"
                  :options="analysis.timeFrequency.hour_frequencies.options"
                ></chart>
              </v-card>
            </v-col>
            <v-col md="12" lg="6" cols="12">
              <v-card>
                <v-card-title>Dakika Sıklıkları</v-card-title>
                <chart
                  :type="'line'"
                  :options="analysis.timeFrequency.minute_frequencies.options"
                ></chart>
              </v-card>
            </v-col>
            <v-col md="12" lg="6" cols="12">
              <v-card>
                <v-card-title>Zaman Sıklıkları</v-card-title>
                <chart
                  :type="'line'"
                  :options="analysis.timeFrequency.time_frequencies.options"
                ></chart>
              </v-card>
            </v-col>
          </v-row>
        </v-tab-item>
        <v-tab-item v-else>
          <v-progress-linear
            indeterminate
            height="5"
            color="green darken-2"
          ></v-progress-linear
        ></v-tab-item>
        <v-tab>Karşılaştırma</v-tab>
        <v-tab-item>
          <div v-for="user in users" :key="user.id">
            <v-card>
              <v-card-title>{{ user.name }}</v-card-title>
              <v-col md="12" lg="6" cols="12">
                <div v-if="comparison(user.id)">
                  Toplam Zaman: {{ comparison(user.id).tt / 60 }} dk Karşılaşma:
                  {{ comparison(user.id).convo_end }} Oran:
                  {{ comparison(user.id).proportion }}
                  <chart :options="comparison(user.id).options"></chart>
                </div>
              </v-col>
              <v-card-actions
                ><v-btn text @click="compare(user.id)"
                  >Karşılaştır</v-btn
                ></v-card-actions
              >
            </v-card>
          </div>
        </v-tab-item>
      </v-tabs>
    </v-col>
  </v-row>
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
  data() {
    var now = new Date().toISOString().substr(0, 10);
    return {
      dtFrom: now,
      dtTo: now,
      dtFromMenu: false,
      dtToMenu: false,
    };
  },
  methods: {
    compare(id) {
      this.$store.dispatch('compare', { id1: this.$route.params.id, id2: id });
    },
    filterSessions() {
      this.$store.dispatch('fetchUserSessions', {
        id: this.$route.params.id,
        from: this.dtFrom,
        to: this.dtTo,
      });
    },
  },
  computed: {
    ...mapGetters([
      'sessions',
      'analysis',
      'users',
      'comparisons',
      'comparison',
    ]),
  },
  mounted() {
    this.$store.dispatch('fetchUserSessions', { id: this.$route.params.id });
    this.$store.dispatch('fetchUserAnalysis', this.$route.params.id);
  },
};
</script>
<template>
  <v-col>
    <v-row>
      <v-col lg="4" md="6" cols="6">
        <v-card>
          <v-card-title>En Aktif Kullanıcılar</v-card-title>
          <chart
            :type="'pie'"
            :options="mostActives.options"
          ></chart>
        </v-card>
      </v-col>
      <v-col lg="4" md="4" cols="6">
        <v-card>
          <v-card-title>Harcanan Zaman</v-card-title>
          <v-list-item three-line>
            <v-list-item-content>
              <v-col>
                <v-list-item-title class="headline">
                  {{ timeSpent.year }}
                </v-list-item-title>
                <v-list-item-subtitle>yıl</v-list-item-subtitle>
                <v-list-item-title class="headline">
                  {{ timeSpent.week }}
                </v-list-item-title>
                <v-list-item-subtitle>hafta </v-list-item-subtitle>
                <v-list-item-title class="headline">
                  {{ timeSpent.day }}
                </v-list-item-title>
                <v-list-item-subtitle>gün</v-list-item-subtitle>
              </v-col>
            </v-list-item-content>
            <v-col>
              <v-list-item-content>
                <v-list-item-title class="headline">
                  {{ timeSpent.hour }}
                </v-list-item-title>
                <v-list-item-subtitle>saat</v-list-item-subtitle>
                <v-list-item-title class="headline">
                  {{ timeSpent.minute }}
                </v-list-item-title>
                <v-list-item-subtitle>dakika</v-list-item-subtitle>
                <v-list-item-title class="headline">
                  {{ timeSpent.second }}
                </v-list-item-title>
                <v-list-item-subtitle>saniye</v-list-item-subtitle>
              </v-list-item-content>
            </v-col>
          </v-list-item>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col lg="4" md="6" cols="12">
        <v-card max-width="800">
          <v-card-title>Günlük Toplam Kullanım</v-card-title>
          <chart
            :type="'line'"
            :options="allDaily.options"
          ></chart>
        </v-card>
      </v-col>
    </v-row>
  </v-col>
</template>

<script>
import { mapGetters } from 'vuex';
import Chart from '../components/Chart.vue';

export default {
  name: 'DashBoard',
  components: {
    Chart,
  },
  computed: {
    ...mapGetters(['timeSpent','mostActives','allDaily']),
  },
  mounted() {
    this.$store.dispatch('fetchTotalTimeSpent');
    this.$store.dispatch('fetchAllDaily');
    this.$store.dispatch('fetchMostActiveUsers');
  },
};
</script>
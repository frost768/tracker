<template>
  <v-container>
    <v-row>
      <v-col lg="4" md="4" cols="6">
        <v-card>
          <v-card-title>En Aktif Kullanıcılar</v-card-title>
          <chart :type="'pie'" :options="chartOptions" :series="series"></chart>
        </v-card>
      </v-col>
      <v-col lg="2" md="2" cols="6">
        <v-card>
          <v-card-title>Harcanan Zaman</v-card-title>
          <v-list-item three-line>
            <v-list-item-content>
              <v-col>
                <v-list-item-title class="headline">
                  {{ Math.floor(totalTime / (3600 * 24 * 365)) }}
                </v-list-item-title>
                <v-list-item-subtitle>yıl</v-list-item-subtitle>
                <v-list-item-title class="headline">
                  {{ Math.floor(totalTime / (3600 * 24 * 7)) }}
                </v-list-item-title>
                <v-list-item-subtitle>hafta </v-list-item-subtitle>
                <v-list-item-title class="headline">
                  {{ Math.floor(totalTime / (3600 * 24)) }}
                </v-list-item-title>
                <v-list-item-subtitle>gün</v-list-item-subtitle>
              </v-col>
            </v-list-item-content>
            <v-col>
              <v-list-item-content>
                <v-list-item-title class="headline">
                  {{ Math.floor(totalTime / 3600) }}
                </v-list-item-title>
                <v-list-item-subtitle>saat</v-list-item-subtitle>
                <v-list-item-title class="headline">
                  {{ Math.floor(totalTime / 60) }}
                </v-list-item-title>
                <v-list-item-subtitle>dakika</v-list-item-subtitle>
                <v-list-item-title class="headline">
                  {{ Math.floor(totalTime) }}
                </v-list-item-title>
                <v-list-item-subtitle>saniye</v-list-item-subtitle>
              </v-list-item-content>
            </v-col>
          </v-list-item>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col lg="6" md="6" cols="12">
        <v-card max-width="800">
          <v-card-title>Günlük Toplam Kullanım</v-card-title>
          <chart :type="'line'" :options="options2" :series="series2"></chart>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Chart from '../components/Chart.vue';
import {
  getTotalTimeSpent,
  mostActiveUsers,
  allDaily,
} from '../services/api.service';
export default {
  name: 'DashBoard',
  components: {
    Chart,
  },
  data() {
    return {
      totalTime: 0,
      mostActiveUsers: [],
      labels: [],
      daily: [],
      options2: {
        chart: {
          type: 'line',
        },

        xaxis: {
          categories: [],
        },
      },
      series2: [
        {
          data: [],
        },
      ],
      series: [],
      chartOptions: {
        labels: [],
      },
    };
  },
  methods: {
    getTotal: async function a() {
      let tt = await getTotalTimeSpent();
      this.totalTime = tt;
      let tt2 = await allDaily();
      this.daily = tt2;
      this.options2.xaxis.categories = this.daily.map((x) => x.day);
      this.series2 = [{ data: tt2.map((x) => x.tt) }];
    },
    mostActive: async function b() {
      let mostActive = await mostActiveUsers();
      this.mostActiveUsers = mostActive.map((x) => {
        return { name: x.id, tt: Math.floor(x.tt / (60 * 24)) };
      });
      this.series = this.mostActiveUsers.map((x) => x.tt);
      this.chartOptions = { labels: this.mostActiveUsers.map((x) => x.name) };
    },
  },

  mounted() {
    this.getTotal();
    this.mostActive();
  },
};
</script>


<style scoped>
</style>

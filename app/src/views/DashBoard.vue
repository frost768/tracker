<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card max-width="500">
          <v-card-title>EN AKTİF KULLANICILAR</v-card-title>
          <div class="ml-5 mb-4 mr-5" :key="user.tt" v-for="user in mostActiveUsers">
            <v-row>
            <v-col>

            <span class="font-weight-bold">{{ user.name }}</span>
            </v-col>
            <v-col>
            {{ user.tt }} saat
            </v-col>
            </v-row>
          </div>
        </v-card>
      </v-col>
      <v-col>
        <v-card max-width="300">
          <v-card-title>HARCANAN ZAMAN</v-card-title>
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
        <v-card class="mx-auto my-12" max-width="800">
          <v-card-title >Dakika Sıklıkları</v-card-title>
          <chart :type="'line'" :options="options2" :series="series2"></chart>
          <!-- <v-sparkline
            color="#fcad03"
            smooth="30"
            fill="fill"
            :value="minuteFreq.freqs"
            :labels="minuteFreq.i"
            auto-draw
          ></v-sparkline> -->
        </v-card>
      </v-col>
      
    </v-row>
  </v-container>
</template>

<script>
import Chart from "../components/Chart";
import { getTotalTimeSpent, mostActiveUsers, allDaily } from "../services/api.service";
export default {
  name: "DashBoard",
  components: {
    Chart
  },
  props: {},
  computed: {},

  watch: {},
  data() {
    return {
      totalTime: 0,
      mostActiveUsers: [],
      labels: [],
      daily: [],
      options2 : {
        chart: {
          type: 'line'
        },

        xaxis: {
          categories: []
        }
      },
      series2: [{
        name: 'sales',
        data: []
      }],
    };
  },
  methods: {
    getTotal: async function a() {
      let tt = await getTotalTimeSpent();
      this.totalTime = tt / 1000;
      let tt2 = await allDaily();
      this.daily = tt2;
      this.options2.xaxis.categories = this.daily.map(x=> x.day)
      this.series2 = [{data: tt2.map(x=> x.tt)}]
    },
    mostActive: async function b() {
      let mostActive = await mostActiveUsers();
      this.mostActiveUsers = mostActive.map((x) => {
        return { name: x.id, tt: Math.floor(x.tt/(1000*60*24)) };
      });
    },
  },

  mounted() {
    this.getTotal();
    this.mostActive();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

<template>
  <div>
    <v-row>
      <v-col lg="2" md="4" cols="12">
        <v-card :loading="loaded" class="mx-auto">
          <template slot="progress">
            <v-progress-linear
              color="green"
              height="10"
              indeterminate
            ></v-progress-linear>
          </template>
          <v-img v-if="user.pp!='./img_avatar5.png'" :src="user.pp"></v-img>
          <v-img v-else src="@/assets/img_avatar5.png" alt=""></v-img>
          <v-card-title v-if="user">{{ user.name }}</v-card-title>
          <v-card-subtitle v-if="user.times.length == 0">Son görülme: {{ lastSeen }}</v-card-subtitle>
          <v-card-subtitle v-else>Son görülme: {{ user.times }}</v-card-subtitle>
          <v-card-subtitle>
            En uzun oturum: {{ Math.floor(longestSession / 60) }} dakika <br>
            Toplam harcanan zaman:
            <v-chip :color="Math.floor(totalTimeSpent / 3600) > 300 ? 'red' : 'green'">{{ Math.floor(totalTimeSpent / 3600) }}</v-chip> saat <br>
            Kullanım yüzdesi: % {{ Math.floor(usagePercent) }}
          </v-card-subtitle>
          <v-card-actions>
            <v-btn
              v-if="!compareLoad"
              color="deep-purple lighten-2"
              text
              @click="compare"
            >
              Karşılaştır
            </v-btn>
            <v-progress-circular
              v-if="compareLoad"
              :size="20"
              color="primary"
              indeterminate
            ></v-progress-circular>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col lg="5" md="4" cols="12">
        <v-card
          v-if="chartdata.datasets[0].data.length"
          :loading="loaded"
          class="mx-auto my-12 col-xs-12"
          max-width="800"
        >
          <v-card-title v-if="user">Oturumlar</v-card-title>
          <v-card-subtitle>{{ chartdata.datasets[0].data.length }} kez</v-card-subtitle>
          <template slot="progress">
            <v-progress-linear
              color="green"
              height="10"
              indeterminate
            ></v-progress-linear>
          </template>
          <v-sparkline
            color="#fcad03"
            smooth="30"
            fill="fill"
            :value="chartdata.datasets[0].data"
            :labels="chartdata.labels"
            auto-draw
          ></v-sparkline>
          <v-date-picker
            v-model="dates"
            range
      ></v-date-picker>
        </v-card>

        <v-card :loading="loaded" class="mx-auto my-12" max-width="800">
          <v-card-title v-if="user">Saat Sıklıkları</v-card-title>
          <template slot="progress">
            <v-progress-linear
              color="green"
              height="10"
              indeterminate
            ></v-progress-linear>
          </template>
          <chart :type="'bar'" :options="options" :series="series"></chart>
          <v-sparkline
            color="#fcad03"
            smooth="30"
            fill="fill"
            :value="hourFreq.freqs"
            :labels="hourFreq.i"
            auto-draw
          ></v-sparkline>
        </v-card>
      </v-col>
      <v-col lg="5" md="4" cols="12">
        <v-card :loading="loaded" class="mx-auto my-12" max-width="800">
          <v-card-title v-if="user">Dakika Sıklıkları</v-card-title>
          <template slot="progress">
            <v-progress-linear
              color="green"
              height="10"
              indeterminate
            ></v-progress-linear>
          </template>
          <v-sparkline
            color="#fcad03"
            smooth="30"
            fill="fill"
            :value="minuteFreq.freqs"
            :labels="minuteFreq.i"
            auto-draw
          ></v-sparkline>
        </v-card>

        <v-card
          v-if="compareArray.series[0].data.length"
          :loading="loaded"
          class="mx-auto my-12"
          max-width="800"
        >
          <v-card-title v-if="user">En Çok Konuşulanlar</v-card-title>
          <template slot="progress">
            <v-progress-linear
              color="green"
              height="10"
              indeterminate
            ></v-progress-linear>
          </template>
          <chart :type="'bar'" :options="compareArray" :series="compareArray.series"></chart>
          <v-sparkline
            color="#fcad03"
            smooth="30"
            fill="fill"
            :value="compareArray.time"
            :labels="compareArray.labels"
            auto-draw
          ></v-sparkline>
        </v-card>

        <v-card :loading="loaded" max-width="800">
          <v-card-title v-if="user">Günlük Kullanım</v-card-title>
          <template slot="progress">
            <v-progress-linear
              color="green"
              height="10"
              indeterminate
            ></v-progress-linear>
          </template>
          <v-sparkline
            color="#fcad03"
            smooth="30"
            fill="fill"
            :value="last24.daily"
            :labels="last24.i"
            auto-draw
          ></v-sparkline>
          <v-slider
            v-model="lastN"
            @change="setlastN"
            min="5"
            thumb-label
          ></v-slider>
        </v-card>
      </v-col>

    </v-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import {
  getUserSessions,
  getUserSessionsAnalysis,
  compareTagee,
} from "../services/api.service";
import Chart from "../components/Chart.vue";

export default {
  name: "UserPage",
  components:{
    Chart,
  },
  data() {
    return {
      loaded: true,
      dates:[],
      lastSeen: "",
      options : {
        chart: {
          type: 'line'
        },

        xaxis: {
          categories: []
        }
      }, 
      series: [{
        name: 'sales',
        data: []
      }],
      
      chartdata: {
        labels: [],
        datasets: [{ backgroundColor: "#fff579", data: [] }],
      },
      hourFreq: { freqs: [], i: [] },
      minuteFreq: { freqs: [], i: [] },
      last24: { daily: [], i: [] },
      longestSession: 0,
      totalTimeSpent: 0,
      usagePercent: 0,
      lastN: 10,
      last24Backup: [],
      compareArray: { xaxis:{ categories: [] }, series:[{ name:'dsfdsf',data: [] }] },
      compareLoad: false,
    };
  },

  methods: {
    async fetchSessions() {
      this.loaded = true;
      // this.compareArray.time = [];
      const res = await getUserSessions({
        id: this.$route.params.id,
        from: "2021-01-25 17:00",
        //to: "2021-01-25 07:30",

      });
      if (res.length) {
        const last = new Date(res[res.length - 1].off);
        this.lastSeen = last.toLocaleString();
        this.chartdata.labels = res.map((y) =>
          new Date(y.on).toLocaleTimeString()
        );
        this.chartdata.datasets[0].data = res.map((k) => k.time);
      } else return [];
    },

    async fetchAnalysis() {
      const res = await getUserSessionsAnalysis({ id: this.$route.params.id });
      this.hourFreq.i = res.hourFreq.map((x) => x.i);
      this.hourFreq.freqs = res.hourFreq.map((x) => x.hourfreq);

      this.options.xaxis.categories = this.hourFreq.i;
      this.series = [{data: this.hourFreq.freqs }];

      this.minuteFreq.i = res.minuteFreq.map((x) => x.i);
      this.minuteFreq.freqs = res.minuteFreq.map((x) => x.minfreq);

      this.last24Backup = res.lastNday;
      this.last24.i = res.lastNday
        .map((x) => x.i)
        .slice(res.lastNday.length - this.lastN, res.lastNday.length);
      this.last24.daily = res.lastNday
        .map((x) => x.daily)
        .slice(res.lastNday.length - this.lastN, res.lastNday.length);

      this.longestSession = res.longestSession / 1000;
      this.totalTimeSpent = res.totalTimeSpent / 1000;
      this.usagePercent = res.usagePercent;
      this.loaded = false;
    },

    async compare() {
      this.compareLoad = true;
      const res = await compareTagee(this.user);
      this.compareLoad = false;
      this.compareArray.xaxis.categories = res.map((x) => x.name);
      this.compareArray.series[0].data = res.map((x) => x.tt / 1000);
    },

    setlastN() {
      this.last24.i = this.last24Backup
        .map((x) => x.i)
        .slice(this.last24Backup.length - this.lastN, this.last24Backup.length);
      this.last24.daily = this.last24Backup
        .map((x) => x.daily)
        .slice(this.last24Backup.length - this.lastN, this.last24Backup.length);
    },
  },
  mounted() {
    this.fetchSessions();
    this.fetchAnalysis();
  },
  computed: {
    ...mapGetters(["users"]),
    user() {
      let user = this.users.find(
        (x) => x.id == parseInt(this.$route.params.id)
      );

      this.fetchSessions();
      this.fetchAnalysis();
      return user;
    },
  },
};
</script>

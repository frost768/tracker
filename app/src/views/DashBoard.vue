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
      </v-col>
      
    </v-row>
  </v-container>
</template>

<script>

import { getTotalTimeSpent, mostActiveUsers } from "../services/api.service";
export default {
  name: "DashBoard",
  props: {},
  computed: {},

  watch: {},
  data() {
    return {
      totalTime: 0,
      mostActiveUsers: [],
      labels: [],
    };
  },
  methods: {
    getTotal: async function a() {
      let tt = await getTotalTimeSpent();
      this.totalTime = tt / 1000;
    },
    mostActive: async function b() {
      let mostActive = await mostActiveUsers();
      this.mostActiveUsers = mostActive.map((x) => {
        return { name: x.name, tt: Math.floor(x.tt / (1000 * 3600)) };
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

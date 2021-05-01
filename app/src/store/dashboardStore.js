import {
  getTotalTimeSpent,
  mostActiveUsers,
  allDaily,
} from '../services/api.service';

const state = {
  timeSpent: {
    year: 0,
    week: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
  },
  mostActives: { options: { labels: [], series: [] } },
  allDaily: { options: { labels: [], series: [] } },
};
const getters = {
  timeSpent: state => state.timeSpent,
  mostActives: (state, getters) => {
    state.mostActives.options.labels = state.mostActives.options.labels.map(
      id => {
        let user = getters.users.find(user => user.id == id);
        id = user ? user.name : id;
        return id;
      }
    );
    return state.mostActives;
  },
  allDaily: state => state.allDaily,
};
const mutations = {
  setTotalTimeSpent(state, totalTime) {
    state.timeSpent.year = Math.floor(totalTime / (60 * 60 * 24 * 365));
    state.timeSpent.week = Math.floor(totalTime / (60 * 60 * 24 * 7));
    state.timeSpent.day = Math.floor(totalTime / (60 * 60 * 24));
    state.timeSpent.hour = Math.floor(totalTime / (60 * 60));
    state.timeSpent.minute = Math.floor(totalTime / 60);
    state.timeSpent.second = Math.floor(totalTime);
  },
  setAllDaily(state, daily) {
    daily.options = {
      xaxis: {
        categories: daily.map(x => x.day),
      },
      series: [{ data: daily.map(x => x.tt) }],
    };
    state.allDaily = daily;
  },
  setMostActiveUsers(state, mostActive) {
    let mostActives = mostActive.map(x => {
      return { name: x.id, tt: Math.floor(x.tt / (60 * 24)) };
    });
    mostActive.options = {
      labels: mostActives.map(x => x.name),
      series: mostActives.map(x => x.tt),
    };
    state.mostActives = mostActive;
  },
};
const actions = {
  async fetchTotalTimeSpent({ commit }) {
    let tt = await getTotalTimeSpent();
    commit('setTotalTimeSpent', tt);
  },
  async fetchAllDaily({ commit }) {
    let daily = await allDaily();
    commit('setAllDaily', daily);
  },
  async fetchMostActiveUsers({ commit }) {
    let mostActive = await mostActiveUsers();
    commit('setMostActiveUsers', mostActive);
  },
};
export default {
  state,
  getters,
  mutations,
  actions,
};

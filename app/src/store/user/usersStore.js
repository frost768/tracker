import {
  getUsers,
  getOnlineUsers,
  getUserSessionsAnalysis,
  getUserSessions,
  compareTagee,
} from '../../services/api.service';

const state = {
  user: {
    id: '',
    pp: '',
    tag: '',
    times: '',
    lastSeen: '',
    analysis: null,
  },
  users: [],
  online: [],
};

const getters = {
  users: () => {
    let onlineUsers = state.users.map(x => {
      let uh = state.online.find(y => y[0] == x.id);
      let status = uh ? true : false;
      let time = uh ? uh[1] : '';
      x.online = status;
      x.times = time;
      return x;
    });
    return onlineUsers;
  },
  user: () => state.user,
  sessions: () => state.user.sessions,
  analysis: () => state.user.analysis,
};

const mutations = {
  setUsers: (state, list) => (state.users = list),
  setOnlineList: (state, list) => (state.online = list),
  setOnline: (state, json) => {
    if (json.type == 'available')
      state.online.push([
        json.id.slice(0, 12),
        new Date().toLocaleTimeString(),
      ]);
    else
      state.online.splice(
        state.online.findIndex(x => x[0] == json.id.slice(0, 12)),
        1
      );
  },

  setUser(state, user) {
      user.times = state.online.find(x => x.id == user.id);
      const time = user.times ? user.times[1] : '';
      user.times = time;
      user.analysis = null;
      user.lastSeen = null;
      user.sessions = null;
    state.user = user;
  },

  setUserSessions(state, sessions) {
    sessions.options = {
      opt: {
        chart: { animations: { enabled: false } },
        xaxis: {
          type: 'datetime',
          labels: {
            datetimeUTC: false,
          },
        },
        
        tooltip: {
          x: {
            format: 'HH:mm:ss',
          },
        },
        plotOptions: {
            bar: {
              horizontal: true
            }
          },
      },
      // Scatter
      series: [{ data: sessions.map(k => [k.time_on, parseInt(k.time_spent)])},],
      // RangeBar
      // series: [{ data: sessions.map((k,ind) => ({ x: 'a'+ind, y: [k.time_on, k.time_off] })) }]
    };
    state.user.sessions = sessions;
  },

  setUserAnalysis(state, analysis) {
    analysis.timeFrequency.hour_frequencies.options = {
      labels: analysis.timeFrequency.hour_frequencies.map(x => x.hour),
      series: analysis.timeFrequency.hour_frequencies.map(x => x.frequency),
    };
    // analysis.options.xaxis.categories = state.analysis.hourFreq.i;
    // analysis.series = [{data: state.analysis.hourFreq.freqs }];
    // analysis.minuteFreq.i = analysis.timeFrequency.minute_frequencies.map((x) => x.minute);
    // analysis.minuteFreq.freqs = analysis.timeFrequency.minute_frequencies.map((x) => x.frequency);
    // analysis.options2.xaxis.categories = state.analysis.minuteFreq.i;
    // analysis.series2 = [{data: state.analysis.minuteFreq.freqs }];
    // analysis.last24Backup = analysis.dailyUsage;
    // analysis.last24.i = analysis.dailyUsage.map((x) => x.day)

    analysis.dailyUsage.options = {
      opt: {
        chart: { animations: { enabled: false } },
      series: [
        { data: analysis.dailyUsage.map(x => x.tt) },
      ],
    }
    };

    // analysis.options3.xaxis.categories = analysis.timeFrequency.time_frequencies.map(x=> x.time);
    // analysis.series3 = [{data:analysis.timeFrequency.time_frequencies.map(x=> x.frequency)}];
    // analysis.longestSession = analysis.longestSession.duration;
    // analysis.longestSessionDay = analysis.longestSession.day;
    // analysis.totalTimeSpent = analysis.totalTime;
    // analysis.usagePercent = analysis.usagePercent;
    state.user.analysis = analysis;
  },
  setUserLastSeen: (state, lastSeen) => (state.user.lastSeen = lastSeen),
};

const actions = {
  async fetchUsers({ commit }) {
    const users = await getUsers();
    users.map(x => (x.online = false));
    users.map(x => (x.times = ''));
    commit('setUsers', users);
  },

  async fetchOnline({ commit }) {
    const online = await getOnlineUsers();
    commit(
      'setOnlineList',
      online.map(x => [x[0], new Date(x[1]).toLocaleTimeString()])
    );
  },

  async fetchUser({ commit }, id) {
    const user = await getUsers({ id });
    commit('setUser', user);
  },

  async compare({ commit }, { id1, id2}) {
    const user = await compareTagee({ id1, id2 });
    commit('setUser', user);
  },

  async fetchUserAnalysis({ commit }, id) {
    const analysis = await getUserSessionsAnalysis({ id });
    commit('setUserAnalysis', analysis);
  },

  async fetchUserSessions({ commit }, id) {
    const sessions = await getUserSessions({ id, from: '2021-01-13' });
    if (sessions.length) {
        const lastSeen = new Date(
            sessions[sessions.length - 1].time_off
          ).toLocaleString();
          commit('setUserSessions', sessions);
          commit('setUserLastSeen', lastSeen);
    } else {
        commit('setUserLastSeen', 'Verilen aralıkta oturum yok');
    }
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
};

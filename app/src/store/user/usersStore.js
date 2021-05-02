import {
  getUsers,
  getOnlineUsers,
  getUserSessionsAnalysis,
  getUserSessions,
  compare,
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
  comparisons: [],
  users: [],
  online: [],
};

const getters = {
  users: () => {
    let onlineUsers = state.users.map(x => {
      let user = state.online.find(y => y[0] == x.id);
      let status = user ? true : false;
      let time = user ? user[1] : '';
      x.online = status;
      x.times = time;
      return x;
    });
    return onlineUsers;
  },
  user: (state) => state.user,
  sessions: (state) => state.user.sessions,
  analysis: (state) => state.user.analysis,
  comparison: (state) => (id)=>state.comparisons.find(x=> x.id2 == id),
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
      series: [
        { name:'Süre (dk)',data: sessions.map(k => [k.time_on, parseInt(k.time_spent / 60)]) },
      ],
    };
    state.user.sessions = sessions;
  },

  setUserAnalysis(state, analysis) {
    analysis.timeFrequency.hour_frequencies.options = {
      chart: { animations: { enabled: false } },
      labels: analysis.timeFrequency.hour_frequencies.map(x => x.hour),
      series: [
        { data: analysis.timeFrequency.hour_frequencies.map(x => x.frequency) },
      ],
    };

    analysis.timeFrequency.minute_frequencies.options = {
      chart: { animations: { enabled: false } },
      labels: analysis.timeFrequency.minute_frequencies.map(x => x.minute),
      series: [
        {
          data: analysis.timeFrequency.minute_frequencies.map(x => x.frequency),
        },
      ],
    };

    analysis.timeFrequency.time_frequencies.options = {
      chart: { animations: { enabled: false } },
      labels: analysis.timeFrequency.time_frequencies.map(x => x.time),
      series: [
        { data: analysis.timeFrequency.time_frequencies.map(x => x.frequency) },
      ],
    };

    analysis.dailyUsage.options = {
      xaxis: {
        type: 'datetime',
        labels: {
          datetimeUTC: false,
        },
      },
      tooltip: {
        x: {
          format: 'dd.MM.yyyy HH:mm:ss',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: [1, 2, 1],
      },
      colors: ['#66C7F4', '#FF0000', '#00FF00'],
      chart: { animations: { enabled: false } },
      yaxis: [
        {},
        { opposite: true },
        {
          opposite: true,
          show: false,
        },
      ],
      series: [
        {
          name: 'Toplam Süre (dk)',
          type: 'column',
          data: analysis.dailyUsage.map(x => [
            x.time_on,
            (x.tt / 60).toFixed(2),
          ]),
        },
        {
          name: 'Ortalama (dk)',
          type: 'line',
          data: analysis.dailyUsage.map(x => [
            x.time_on,
            (x.avg / 60).toFixed(2),
          ]),
        },
        {
          name: 'Giriş Sayısı',
          type: 'column',
          data: analysis.dailyUsage.map(x => [x.time_on, x.times]),
        },
      ],
    };
    state.comparisons = [];
    state.user.analysis = analysis;
  },
  setUserLastSeen: (state, lastSeen) => (state.user.lastSeen = lastSeen),
  setComparison: (state, userComparison) => {
    let list = state.comparisons;
    userComparison.options = {
      xaxis: {
        type: 'datetime',
        labels: {
          datetimeUTC: false,
        },
      },
      tooltip: {
        x: {
          format: 'dd.MM.yyyy HH:mm:ss',
        },
      },
      chart: { animations: { enabled: false } },
      series: [
        {
          name: 'Ortak Zaman (sn)',
          type: 'line',
          data: userComparison.encounter.map(x => [x.day.u1on,(x.time).toFixed(2)]),
        },
      ],
    };
    if(!list.find(x=> x.id2 == userComparison.id2))
    list.push(userComparison);
    state.comparisons = list;
  },
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

  async compare({ commit }, { id1, id2 }) {
    const comparisonResult = await compare({ id1, id2 });
    commit('setComparison', comparisonResult);
  },

  async fetchUserAnalysis({ commit }, id) {
    const analysis = await getUserSessionsAnalysis({ id });
    commit('setUserAnalysis', analysis);
  },

  async fetchUserSessions({ commit }, query) {
    let now = new Date();
    let { 
      id, 
      from = now.toDateString(), 
      to = new Date(now.getFullYear(),now.getMonth(), now.getDate()+1).toDateString(), 
      minute_limit 
    } = query; 
    const sessions = await getUserSessions({ id, from, to, minute_limit });
    if (sessions.length) {
      const lastSeen = new Date(
        sessions[sessions.length - 1].time_off
      ).toLocaleString();
      commit('setUserSessions', sessions);
      commit('setUserLastSeen', lastSeen);
    } else {
      commit('setUserSessions', []);
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

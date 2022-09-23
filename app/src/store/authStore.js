const state = {
    qr: undefined,
    connected: localStorage.getItem('connected')
};

const getters = {
    qr: state => state.qr,
    connected: state => state.connected
};

const mutations = {
    setQR: (state, qr) => state.qr = qr,
    setConnected: (state, connected) => {
        localStorage.setItem('connected', connected);
        return state.connected = connected;
    },
};

const actions = {

};

export default {
    state,
    getters,
    mutations,
    actions
}

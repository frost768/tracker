const state = {
    qr: undefined,
    connected: false
};

const getters = {
    qr: state => state.qr,
    connected: state => state.connected
};

const mutations = {
    setQR: (state, qr) => state.qr = qr,
    setConnected: (state, connected) => state.connected = connected,
};

const actions = {

};

export default {
    state,
    getters,
    mutations,
    actions
}

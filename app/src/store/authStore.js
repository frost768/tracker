const state = {
    qr: undefined,
};

const getters = {
    qr: state => state.qr
};

const mutations = {
    setQR: (state, qr) => state.qr = qr,
};

const actions = {

};

export default {
    state,
    getters,
    mutations,
    actions
}

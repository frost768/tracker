import { 
    getUsers,
    getOnlineUsers 
} from "../../services/api.service";
const state={
    users:[],
    online:[],
}
const getters = {
    users: (state) => {
        let onlineUsers = state.users.map(x=>{
            let uh = state.online.find(y=> y[0] == x.id);
            let status= uh ? true : false;
            let time= uh ? uh[1] : '';
            x.online = status;
            x.times = time;
            return x
        })
        return onlineUsers;
    }
}

const mutations = {
    setUsers: (state,list) => (state.users = list),
    setOnlineList: (state,list) => (state.online = list),
    setOnline: (state,json) => {
        if(json.type=="available") state.online.push([json.id.slice(0,12),new Date().toLocaleTimeString()])
        else {
            state.online.splice(state.online.findIndex(x=> x[0]==json.id.slice(0,12)),1)
        }
    }
}

const actions={
    async fetchUsers({ commit }){
        const users = await getUsers()
        users.map(x=> x.online = false);
        users.map(x=> x.times = '');
        commit('setUsers', users)
    },

    async fetchOnline({ commit }){
        const online = await getOnlineUsers();
        commit('setOnlineList',online.map(x=> [x[0],new Date(x[1]).toLocaleTimeString()]))
    }

    
}

export default {
    state,
    getters,
    mutations,
    actions
}
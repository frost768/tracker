// const {
//     getUserSessions,
//     getUserSessionsAnalysis,
//     getAllTimeSpent,
//     mostActiveUsers,
//     compareUsers,
//     getUserLast24Hour
// } = require('../repos/session_repository.js')
const { 
    getUser,
    compareTagee,
    getOnlineUsers
} = require('../repos/user_repository.js')

const {
    getAllTimeSpentDB,
    getUserSessionsDB,
    mostActiveUsersDB,
    compareUsersDB,
    getUserLast24HourDB,
    getUserSessionsAnalysisDB,
} = require('../repos/session_repository_sqlite.js')

const api = '/api/';
const sessions = 'sessions';
const user = 'user';
const online = 'online';
const statistics = 'statistics';

const endpoints = {
    USER_LAST24HOUR: { 
        action: id => getUserLast24HourDB(id),
        url: api + user + '/' + 'last24'
    },

    USER_STATISTICS: { 
        action: id => getUserSessionsAnalysisDB(id),
        url: api + user + '/'+ statistics
    },

    ALL_TIME_SPENT : {
        action: () => getAllTimeSpentDB(),
        url: api + statistics
    },

    MOST_ACTIVE_USERS:{
        action: () => mostActiveUsersDB(),
        url: api + 'mostactive'
    },
    
    USER_SESSIONS:{ 
        action: query => getUserSessionsDB(query),
        url: api + sessions 
    },

    COMPARE_USERS:{ 
        action: users => compareUsersDB(users),
        url: api + sessions + '/compare'
    },

    COMPARE_USER_TAGEE:{ 
        action: user => compareTagee(user),
        url: api + user + '/compare/tagee'
    },

    USER: { 
        action: user => getUser(user),
        url: api + user 
    },

    ONLINE_USERS: { 
        action:() => getOnlineUsers(),
        url: api + user + '/' + online
    },

    // COMPARE_USERS:{ 
    //     action: (users) => compareUsers(users),
    //     url: api + sessions + '/compare'
    // },
    // USER_SESSIONS:{ 
    //     action: user => getUserSessions(user),
    //     url: api + sessions 
    // },
 
    // USER_LAST24HOUR: { 
    //     action:(user) => getUserLast24Hour(user),
    //     url: api + user + '/' + 'last24'
    // },

    // USER_STATISTICS: { 
    //     action: (user) => getUserSessionsAnalysis(user),
    //     url: api + user + '/'+ statistics
    // },

    // ALL_TIME_SPENT : {
    //     action: () => getAllTimeSpent(),
    //     url: api + statistics
    // },

    // MOST_ACTIVE_USERS:{
    //     action: () => mostActiveUsers(),
    //     url: api + 'mostactive'
    // },

    NOT_FOUND:{
        action: (path) =>  '404 NOT FOUND: ' + path,
        url:'404'
    }
}

module.exports = {
    endpoints
}
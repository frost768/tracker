const {
    getUserSessions,
    getUserSessionsAnalysis,
    getAllTimeSpent,
    mostActiveUsers,
    compareUsers,
    getUserLast24Hour
} = require('../repos/session_repository.js')
const { 
    getUser,
    compareTagee,
    getOnlineUsers
} = require('../repos/user_repository.js')

const {
    getUserSessionsDB,
    getUserSessionsAnalysisDB,
    mostActiveUsersDB,
    getAllTimeSpentDB
} = require('../repos/session_repository_sqlite.js')

const api = '/api/';
const sessions = 'sessions';
const user = 'user';
const online = 'online';
const statistics = 'statistics';

const endpoints = {
    TEST4:{ 
        action: () => getAllTimeSpentDB(),
        url:api + 'test4' 
    },
    TEST3:{ 
        action: () => mostActiveUsersDB(),
        url:api + 'test3' 
    },
    TEST2:{ 
        action: () => getUserSessionsAnalysisDB({id:905375584811}),
        url:api + 'test2' 
    },
    TEST:{ 
        action: () => getUserSessionsDB({id:905375584811,from:new Date("2021-01-01"),to:new Date("2021-01-02")}),
        url:api + 'test' 
    },
    USER_SESSIONS:{ 
        action: (user) => getUserSessions(user),
        url:api + sessions 
    },

    COMPARE_USERS:{ 
        action: (users) => compareUsers(users),
        url:api + sessions + '/compare'
    },

    COMPARE_USER_TAGEE:{ 
        action: (user) => compareTagee(user),
        url:api + user + '/compare/tagee'
    },

    USER: { 
        action:(user) => getUser(user),
        url:api + user 
    },

    USER_LAST24HOUR: { 
        action:(user) => getUserLast24Hour(user),
        url:api + user + '/' + 'last24'
    },

    ONLINE_USERS: { 
        action:() => getOnlineUsers(),
        url:api + user + '/' + online
    },

    USER_STATISTICS: { 
        action: (user) => getUserSessionsAnalysis(user),
        url:api + user + '/'+ statistics
    },

    ALL_TIME_SPENT : {
        action: () => getAllTimeSpent(),
        url:api + statistics
    },

    MOST_ACTIVE_USERS:{
        action: () => mostActiveUsers(),
        url:api + 'mostactive'
    },

    NOT_FOUND:{
        action: (path) =>  '404 NOT FOUND: ' + path,
        url:'404'
    }
}

module.exports = {
    endpoints
}
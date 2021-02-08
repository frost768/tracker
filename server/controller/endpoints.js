const { 
    getUser,
    getOnlineUsers
} = require('../repos/user_repository.js')

const {
    analyze,
    totalTimeSpent,
    getUserUsagePercent,
    getUserLongestSession,
    getUserTimeFrequency,
    getUserDailyUsage,
    getUserSessions,
    mostActiveUsers,
    dailyUsage,
} = require('../services/Analysis');

const api = '/api/';
const sessions = 'sessions';
const user = 'user';
const online = 'online';
const statistics = 'statistics';

const endpoints = {
    // ANALYSIS
    USER_SESSIONS:{ 
        action: query => getUserSessions(query),
        url: api + sessions 
    },

    USER_STATISTICS: { 
        action: id => analyze(id),
        url: api + user + '/'+ statistics
    },

    USER_USAGE_PERCENT: { 
        action: id => getUserUsagePercent(id),
        url: api + user + '/' + 'usage-percent'
    },

    USER_LONGEST_SESSION: { 
        action: id => getUserLongestSession(id),
        url: api + user + '/' + 'longest'
    },

    USER_TIME_FREQ: { 
        action: id => getUserTimeFrequency(id),
        url: api + user + '/' + 'time-freq'
    },

    USER_DAILY: { 
        action: id => getUserDailyUsage(id),
        url: api + user + '/' + 'daily'
    },

    ALL_TIME_SPENT : {
        action: () => totalTimeSpent(),
        url: api + 'all/total-time'
    },

    ALL_DAILY_USAGE : {
        action: () => dailyUsage(),
        url: api + 'all/daily'
    },

    MOST_ACTIVE_USERS:{
        action: () => mostActiveUsers(),
        url: api + 'mostactive'
    },

    COMPARE_USERS:{ 
        url: api + sessions + '/compare'
    },

    COMPARE_USER_TAGEE:{
        url: api + user + '/compare/tagee'
    },

    // USER REPOSITORY
    USER: { 
        action: user => getUser(user),
        url: api + user 
    },

    ONLINE_USERS: { 
        action:() => getOnlineUsers(),
        url: api + user + '/' + online
    },

    NOT_FOUND:{
        action: (path) =>  '404 NOT FOUND: ' + path,
        url:'404'
    }
}

module.exports = {
    endpoints
}
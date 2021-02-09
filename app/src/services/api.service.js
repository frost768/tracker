import { request } from './httpClient';

export function getUsers(user){
    return request(endpoints.USER.url,user)
}

export function getOnlineUsers(){
    return request(endpoints.ONLINE_USERS.url)
}

export function getUserSessions(user){
    return request(endpoints.USER_SESSIONS.url,user)
}

export function getTotalTimeSpent(){
    return request(endpoints.ALL_TIME_SPENT.url)
}

export function mostActiveUsers(){
    return request(endpoints.MOST_ACTIVE_USERS.url)
}

export async function getUserSessionsAnalysis(user){
    return request(endpoints.USER_STATISTICS.url,user);
}

export async function getUserLast24Hour(user){
    return request(endpoints.USER_DAILY.url,user);
}

export async function compareTagee(user){
    return request(endpoints.COMPARE_USER_TAGEE.url,user);
}

export async function allDaily(){
    return request(endpoints.ALL_DAILY_USAGE.url);
}

const api = '/api/';
const sessions = 'sessions';
const user = 'user';
const online = 'online';
const statistics = 'statistics';

const endpoints = {
    // ANALYSIS
    USER_SESSIONS:{ 
        url: api + sessions 
    },

    USER_STATISTICS: { 
        url: api + user + '/'+ statistics
    },

    USER_USAGE_PERCENT: {
        url: api + user + '/' + 'usage-percent'
    },

    USER_LONGEST_SESSION: {
        url: api + user + '/' + 'longest'
    },

    USER_TIME_FREQ: { 
        url: api + user + '/' + 'time-freq'
    },

    USER_DAILY: { 
        url: api + user + '/' + 'daily'
    },

    ALL_TIME_SPENT : {
        url: api + 'all/total-time'
    },

    ALL_DAILY_USAGE : {
        url: api + 'all/daily'
    },

    MOST_ACTIVE_USERS: {
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
        url: api + user 
    },

    ONLINE_USERS: { 
        url: api + user + '/' + online
    },

    NOT_FOUND:{
        action: (path) =>  '404 NOT FOUND: ' + path,
        url:'404'
    }
}
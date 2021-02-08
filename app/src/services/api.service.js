import { request } from './httpClient';

export function getUsers(user){
    return request('/api/user',user)
}

export function getOnlineUsers(){
    return request('/api/user/online')
}

export function getUserSessions(user){
    return request('/api/sessions',user)
}

export function getTotalTimeSpent(){
    return request('/api/statistics')
}

export function mostActiveUsers(){
    return request('/api/mostactive')
}

export async function getUserSessionsAnalysis(user){
    return request('/api/user/statistics',user);
}

export async function getUserLast24Hour(user){
    return request('/api/user/last24',user);
}

export async function compareTagee(user){
    return request('/api/user/compare/tagee',user);
}
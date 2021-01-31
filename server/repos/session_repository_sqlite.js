const Database = require('better-sqlite3');
const db = new Database('./data/deneme.db');

const { AnalysisDB } = require('../services/AnalysisDB');

function getUserSessionsDB({ id, name, from, to }) {
    from = Date.parse(from);
    to = Date.parse(to);

    let query = `SELECT * FROM u${id}`;
    if(from) query+=` WHERE time_on > ${from}`
    if(to) query+=` AND time_on < ${to}`

    const stmt = db.prepare(query);
    return stmt.all();
}

function getUserSessionsAnalysisDB(user) {
    let analysis = AnalysisDB.analyze(user.id)
    if(analysis) return analysis;
    else return [];
}

function getUserLast24HourDB(user) {
    let sessions = getUserSessions(user);
    let analysis = AnalysisDB.lastN24HourUsage(sessions)
    if(analysis) return analysis;
    else return [];
}

const getAllTimeSpentDB = () => AnalysisDB.totalTimeSpentAll();

const mostActiveUsersDB = () => AnalysisDB.mostActiveUsers();


module.exports = {
    getAllTimeSpentDB,
    getUserSessionsDB,
    mostActiveUsersDB,
    getUserLast24HourDB,
    getUserSessionsAnalysisDB
}
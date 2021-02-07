const { AnalysisDB } = require("../services/AnalysisDB");

function getUserSessionsAnalysisDB(id) {
  let analysis = AnalysisDB.analyze(id);
  if (analysis) return analysis;
  else return [];
}

function getUserLast24HourDB(id) {
    let analysis = AnalysisDB.lastN24HourUsage(id);
    if (analysis) return analysis;
    else return [];
}

const compareUsersDB = query => AnalysisDB.compareUsersDB(query);

const getUserSessionsDB = query => AnalysisDB.getUserSessionsDB(query);

const getUsagePercentDB = id => AnalysisDB.getUsagePercent(id);

const getAllTimeSpentDB = () => AnalysisDB.totalTimeSpentAll();

const mostActiveUsersDB = () => AnalysisDB.mostActiveUsers();

module.exports = {
  compareUsersDB,
  getAllTimeSpentDB,
  getUserSessionsDB,
  mostActiveUsersDB,
  getUsagePercentDB,
  getUserLast24HourDB,
  getUserSessionsAnalysisDB,
};

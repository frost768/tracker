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

function compareUsersDB({ id1, id2, min }) {
    if (!min) min = 0;
    const MINIMUM_MINUTE = min * 60;
    let begin, end, begin_sessions, end_sessions, encounter = [];
    let u1s = AnalysisDB.getUserSessionsDB({ id: id1 });
    let u2s = AnalysisDB.getUserSessionsDB({ id: id2 });
    if(!u1s.length || !u2s.length) return { "convo_end": 0, "encounter": 0, "tt": 0 };

    /*
    const usr1_first = u1s[0].time_on;
     const usr2_first = u2s[0].time_on;
     const usr1_last = u1s[u1s.length - 1].time_off;
     const usr2_last = u2s[u2s.length - 1].time_off;
     if (usr1_first > usr2_first) {
         begin = usr1_first;
         begin_sessions = u1s;
     }
     else {
         begin = usr2_first;
         begin_sessions = u2s;
     }
     if (usr1_last > usr2_last) {
         end = usr2_last;
         end_sessions = u1s.filter(x => x.time_on < end && x.time_off > begin);
     }
     else {
         end = usr1_last;
         end_sessions = u2s.filter(x => x.time_on < end && x.time_off > begin);
     }
     */

    begin_sessions = u1s;
    end_sessions = u2s;
    
    for (var i = 0; i < begin_sessions.length; i++) {
        const u1 = begin_sessions[i];
        end_sessions.forEach(u2 => {
            const impossible = (u1.time_on > u2.time_on && u1.time_on > u2.time_off) || (u2.time_on > u1.time_off && u2.time_off > u1.time_off);
            if (impossible) return; 
            const u2_entered_in_u1_time = u1.time_on < u2.time_on && u2.time_on < u1.time_off;
            const u2_left_in_u1_time = u1.time_on < u2.time_off && u2.time_off < u1.time_off;
            const u2_in_u1 = u2_entered_in_u1_time && u2_left_in_u1_time;
            const u2_left_after_u1 = u2_entered_in_u1_time && u2.time_off > u1.time_off;
            const u2_entered_and_left_first = u2.time_on < u1.time_on && u2_left_in_u1_time;
            // let u2_entered_before_u1 = !u2_entered_in_u1_time && u2.time_on < u1.time_on;
            // let U1JoinAndU2LeavesBefore = u2_entered_before_u1 && (u1.time_on < u2.time_off && u1.time_on > u2.time_on);
            const u1date = new Date(u1.time_on).toLocaleString('tr');
            const u2date = new Date(u2.time_off).toLocaleString('tr');
            const day = { u1date, u2date };
            
            if (u2_in_u1) {
                const time = parseInt((u2.time_spent) / 1000);
                if (time < MINIMUM_MINUTE) return;
                encounter.push({ day, time });
            }
            if (u2_left_after_u1) {
                const time = parseInt((u1.time_off - u2.time_on) / 1000);
                if (time < MINIMUM_MINUTE) return;
                encounter.push({ day, time });
            }
            if (u2_entered_and_left_first) {
                const time = parseInt((u2.time_off - u1.time_on) / 1000);
                if (time < MINIMUM_MINUTE) return;
                encounter.push({ day, time });
            }
        });
    };

    const convo_end = encounter.length;
    const tt = encounter.reduce((a, b) => a + b.time, 0);
    const proportion = tt / convo_end;
    return { convo_end, encounter, tt, proportion };

}
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

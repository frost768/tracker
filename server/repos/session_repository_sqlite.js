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

function compareUsersDB({id1,id2}) {
    var begin, end, begin_sessions, end_sessions, encounter = [], convo_end = 0;
    let user1sessions= AnalysisDB.getUserSessionsDB({id:id1});
    let user2sessions= AnalysisDB.getUserSessionsDB({id:id2});
    if(!user1sessions.length || !user2sessions.length) return { "convo_end": 0, "encounter": 0, "tt": 0 };
    var usr1_first =user1sessions[0].on, usr2_first = user2sessions[0].on, 
    usr1_last = user1sessions[user1sessions.length - 1].time_off, 
    usr2_last = user2sessions[user2sessions.length - 1].time_off;
    if (usr1_first > usr2_first) {
        begin = usr1_first;
        begin_sessions = user1sessions;
    }
    
    else {
        begin = usr2_first;
        begin_sessions = user2sessions;
    }
    
    if (usr1_last > usr2_last) {
        end = usr2_last;
        end_sessions = user1sessions.filter(function (x) { return x.time_on < end && x.time_off > begin; });
    }
    
    else {
        end = usr1_last;
        end_sessions = user2sessions.filter(function (x) { return x.time_on < end && x.time_off > begin; });
    }

    begin_sessions = user1sessions;
    end_sessions = user2sessions;
    var _loop_2 = function (i) {
        var u1 = begin_sessions[i];
        end_sessions.forEach(function (u2) {
            if((u1.time_on > u2.time_on && u1.time_on > u2.time_off) || (u2.time_on > u1.time_off && u2.time_off > u1.time_off)) return; 
            var U2OnInU1Time = u1.time_on < u2.time_on && u2.time_on < u1.time_off;
            var U2OffInU1Time = u1.time_on < u2.time_off && u2.time_off < u1.time_off;
            var U2Sess_In_U1Sess = U2OnInU1Time && U2OffInU1Time;
            var U2OffLaterThanU1Off = U2OnInU1Time && u2.time_off > u1.time_off;
            var U2OnNotInU1TimeAndBeforeU1On = !U2OnInU1Time && u2.time_on < u1.time_on;
            var U1JoinAndU2LeavesBefore = U2OnNotInU1TimeAndBeforeU1On && (u1.time_on < u2.time_off && u1.time_on > u2.time_on);
            if (U2Sess_In_U1Sess) {
                encounter.push((u2.time_spent) / 1000);
                convo_end++;
            }
            if (U2OffLaterThanU1Off) {
                encounter.push((u1.time_off - u2.time_on) / 1000);
                convo_end++;
            }
            if (u2.time_on < u1.time_on && U2OffInU1Time) {
                encounter.push((u2.time_off - u1.time_on) / 1000);
                convo_end++;
            }
            var b = (u2.time_off - u1.time_off) < 1200000
                && (u2.time_off - u1.time_off) > 0, a = (u1.time_off - u2.time_off) < 1200000
                && (u1.time_off - u2.time_off) > 0;
            if (b || a) {
              convo_end++;
            }
        });
    };
    // console.log(usr1.name, ' daha eski veriye sahip:', begin_sessions.length, usr2.name, ' daha yeni veri:', end_sessions.length, usr1.name, ' oturum sayısı:', usr1.sessions.length, usr2.name, ' oturum sayısı:', usr2.sessions.length)
    for (var i = 0; i < begin_sessions.length; i++) {
        _loop_2(i);
    };
    return { "convo_end": convo_end, "encounter": encounter, "tt": encounter.reduce(function (a, b) { return a + b; }, 0) };

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

const db = require('../data/data/db.json');
const { Analysis } = require('../services/Analysis');

function getUserSessions({ id, name, from, to }) {
    let sessions = [];  
    from = Date.parse(from);
    to = Date.parse(to);
    
    let user = db.find(x=>x.id == id || x.name == name);
    if(user) {
        sessions = user.sessions;
        if(from) sessions = sessions.filter(x=> x.on > from)
        if(to) sessions = sessions.filter(x=> x.on < to)
        return sessions.filter(x=> x.time/(1000*60)<120);
    }
    else return [];
}

function getUserSessionsAnalysis(user) {
    let sessions = getUserSessions(user);
    let analysis = Analysis.analyze(sessions)
    if(analysis) return analysis;
    else return [];
}

function getUserLast24Hour(user) {
    let sessions = getUserSessions(user);
    let analysis = Analysis.lastN24HourUsage(sessions)
    if(analysis) return analysis;
    else return [];
}

function compareUsers({id1,id2}) {
    var begin, end, begin_sessions, end_sessions, encounter = [], convo_end = 0;
    let user1sessions= getUserSessions({id:id1});
    let user2sessions= getUserSessions({id:id2});
    if(!user1sessions.length || !user2sessions.length) return { "convo_end": 0, "encounter": 0, "tt": 0 };
    var usr1_first =user1sessions[0].on, usr2_first = user2sessions[0].on, 
    usr1_last = user1sessions[user1sessions.length - 1].off, 
    usr2_last = user2sessions[user2sessions.length - 1].off;
    
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
        end_sessions = user1sessions.filter(function (x) { return x.on < end && x.off > begin; });
    }
    
    else {
        end = usr1_last;
        end_sessions = user2sessions.filter(function (x) { return x.on < end && x.off > begin; });
    }

    begin_sessions = user1sessions;
    end_sessions = user2sessions;
    var _loop_2 = function (i) {
        var u1 = begin_sessions[i];
        let h=0;
        end_sessions.forEach(function (u2) {
            if((u1.on > u2.on && u1.on > u2.off) || (u2.on > u1.off && u2.off > u1.off)) return; 
            var U2OnInU1Time = u1.on < u2.on && u2.on < u1.off;
            var U2OffInU1Time = u1.on < u2.off && u2.off < u1.off;
            var U2Sess_In_U1Sess = U2OnInU1Time && U2OffInU1Time;
            var U2OffLaterThanU1Off = U2OnInU1Time && u2.off > u1.off;
            var U2OnNotInU1TimeAndBeforeU1On = !U2OnInU1Time && u2.on < u1.on;
            var U1JoinAndU2LeavesBefore = U2OnNotInU1TimeAndBeforeU1On && (u1.on < u2.off && u1.on > u2.on);
            if (U2Sess_In_U1Sess) {
                encounter.push((u2.time) / 1000);
                convo_end++;
            }
            if (U2OffLaterThanU1Off) {
                encounter.push((u1.off - u2.on) / 1000);
                convo_end++;
            }
            if (u2.on < u1.on && U2OffInU1Time) {
                encounter.push((u2.off - u1.on) / 1000);
                convo_end++;
            }
            var b = (u2.off - u1.off) < 1200000
                && (u2.off - u1.off) > 0, a = (u1.off - u2.off) < 1200000
                && (u1.off - u2.off) > 0;
            if (b || a) {
                // convo_end++;
            }
        });
    };
    // console.log(usr1.name, ' daha eski veriye sahip:', begin_sessions.length, usr2.name, ' daha yeni veri:', end_sessions.length, usr1.name, ' oturum sayısı:', usr1.sessions.length, usr2.name, ' oturum sayısı:', usr2.sessions.length)
    for (var i = 0; i < begin_sessions.length; i++) {
        _loop_2(i);
    }
    ;
    return { "convo_end": convo_end, "encounter": encounter, "tt": encounter.reduce(function (a, b) { return a + b; }, 0) };

}

const getAllTimeSpent = () => Analysis.totalTimeSpentAll(db);

const mostActiveUsers = () => Analysis.mostActiveUsers(db);


module.exports = {
    compareUsers,
    getAllTimeSpent,
    getUserSessions,
    mostActiveUsers,
    getUserLast24Hour,
    getUserSessionsAnalysis
}
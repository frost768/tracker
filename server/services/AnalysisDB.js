const Database = require("better-sqlite3");
const db = new Database("./data/deneme.db");
class AnalysisDB {
  /**
   * Return analysis of the user sessions
   * @param sessions
   * @description AnalysisDBArray [totalTimeSpent, usagePercent, longestSession, freq]
   */
  static analyze({id}) {
    let totalTimeSpent = AnalysisDB.getTotalTime(id);
    let usagePercent = AnalysisDB.getUsagePercent(id);
    let longestSession = AnalysisDB.getLongestSession(id);
    let hourFreq = AnalysisDB.frequency(id, "h");
    let minuteFreq = AnalysisDB.frequency(id, "m");
    let lastNday = AnalysisDB.lastN24HourUsage(id);
    let analysis = {
      totalTimeSpent,
      usagePercent,
      longestSession,
      hourFreq,
      minuteFreq,
      lastNday,
    };
    return analysis;
  }

  static compareUsersDB({ id1, id2, min }) {
    if (!min) min = 0;
    const MINIMUM_MINUTE = min * 60;
    let begin, end, begin_sessions, end_sessions, encounter = [];
    let u1s = AnalysisDB.getUserSessionsDB({ id: id1 });
    let u2s = AnalysisDB.getUserSessionsDB({ id: id2 });
    if(!u1s.length || !u2s.length) return { "convo_end": 0, "encounter": 0, "tt": 0 };

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


    //begin_sessions = u1s;
    //end_sessions = u2s;

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

  static compareUsers({ id1, id2, min }) {
    const temp_u1 = `create temp table u1 as select * from sessions where user_id = ${id1}`
    const temp_u2 = `create temp table u2 as select * from sessions where user_id = ${id2}`
    let u2_in_u1 =
    `select (u2.time_spent / 1000) as time from u1 , u2
     where 
        (u2.time_on BETWEEN u1.time_on and u1.time_off) and 
        (u2.time_off BETWEEN u1.time_on and u1.time_off)`

    let u2_left_after_u1 = 
    `select (u1.time_off - u2.time_on) / 1000 as time from u1 , u2
     where 
        (u2.time_on between u1.time_on and u1.time_off) and 
        u2.time_off > u1.time_off`

    let u2_entered_and_left_first =
    `select (u1.time_off - u2.time_on) / 1000 as time from u1, u2
     where 
        (u2.time_off between u1.time_on and u1.time_off) and 
        u2.time_on < u1.time_on`

    if (min)  {
      u2_in_u1 += ` and time > ${min};`
      u2_left_after_u1 += ` and time > ${min};`
      u2_entered_and_left_first += ` and time > ${min};`
    }
    else {
      u2_in_u1 += ';'
      u2_left_after_u1 += ';'
      u2_entered_and_left_first += ';'
    }
    db.prepare(temp_u1).run();
    db.prepare(temp_u2).run();
    const u2_in_u1_result = db.prepare(u2_in_u1).all();
    const u2_left_after_u1_result = db.prepare(u2_left_after_u1).all();
    const u2_entered_and_left_first_result = db.prepare(u2_entered_and_left_first).all();
    return [u2_in_u1_result,u2_left_after_u1_result,u2_entered_and_left_first_result];
  }

  static getUserSessionsDB({ id, name, from, to }) {
      from = Date.parse(from);
      to = Date.parse(to);
      let query = `SELECT time_on, time_off, time_spent FROM sessions WHERE user_id = ${id}`;
      if (from) query += ` AND time_on > ${from}`;
      if (to) query += ` AND time_on < ${to}`;
      return db.prepare(query).all();
  }

  static getTotalTime(id) {
    return db.prepare("SELECT sum(time_spent) as tt FROM sessions WHERE user_id = " + id).pluck().get();
  }

  static getUsagePercent(id) {
    const first = db.prepare(  "SELECT time_on FROM sessions WHERE user_id = " + id + " LIMIT 1").pluck().get();
    const last =  db.prepare(  "SELECT time_off FROM sessions WHERE user_id = " +    id + " ORDER BY id DESC LIMIT 1").pluck().get();
    return (this.getTotalTime(id) / (last - first)) * 100;
  }

  static getLongestSession(id) {
    if(id) return db.prepare("SELECT max(time_spent) FROM sessions WHERE user_id = " + id).pluck().get();
  }
  /**
   * Get frequency of sessions based on span (default is hours)
   * @param type h or m
   */
  static frequency(id, type) {
    let sessions = AnalysisDB.getUserSessionsDB({id});
    if (sessions.length) {
      var freqs = [];
      var freq = 0;
      var len;
      type == "h" ? (len = 24) : (len = 60);
      for (let i = 0; i < len; i++) {
        for (let j = 0; j < sessions.length; j++) {
          var a = new Date(sessions[j].time_off);
          if(type == "h" & a.getHours() == i) freq++ 
          else if (a.getMinutes() == i) freq++ 
        }
        if(type == "m") freqs.push({ i: i, minfreq: freq })
        else freqs.push({ i: i, hourfreq: freq });
        freq = 0;
      }

      return freqs;
    } else if (type == "h") return [{ i: 0, hourfreq: 0 }];
    else return [{ i: 0, minfreq: 0 }];
  }

  static mostActiveUsers() {
    return db.prepare("SELECT user_id as id, sum(time_spent) as tt FROM sessions GROUP BY id ORDER BY tt DESC LIMIT 5").all();
  }

  static lastN24HourUsage(id) {
    let sessions = AnalysisDB.getUserSessionsDB({id});
    if (sessions.length) {
      var lastNArray = [];
      var oldest = sessions[0].time_on;
      var mostRecent = sessions[sessions.length - 1].time_off;
      var totalTime = Math.floor((mostRecent - oldest) / 86400000);
      if (totalTime) {
        var last24 = mostRecent - 86400000;
        var j = sessions.length - 2;
        for (let i = 0; i < totalTime; i++) {
          var daily = 0;
          while (sessions[j].time_on > last24) {
            daily += sessions[j].time_spent;
            j--;
          }
          last24 -= 86400000;
          lastNArray.push({ i: i + 1, daily: daily });
        }
      } else return [{ i: 0, daily: AnalysisDB.getTotalTime(id) }];
      return lastNArray.reverse();
    } else return [{ i: 0, daily: 0 }];
  }

  static totalTimeSpentAll() {
    return db.prepare("SELECT sum(time_spent) FROM sessions").pluck().get();
  }

  static mean(sessions) {
    return this.getTotalTime(sessions) / sessions.length;
  }

  static std(sessions) {
    return Math.sqrt(
      sessions
        .map((x) => (x - this.mean(sessions)) ** 2)
        .reduce((a, b) => a + b, 0) / sessions.length
    );
  }
}

module.exports = {
  AnalysisDB,
};

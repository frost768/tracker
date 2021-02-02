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

  // USER SESSIONS
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

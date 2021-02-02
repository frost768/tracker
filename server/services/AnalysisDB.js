const Database = require('better-sqlite3')
const db = new Database('./data/deneme.db');
class AnalysisDB {
  /**
   * Return analysis of the user sessions
   * @param sessions
   * @description AnalysisDBArray [totalTimeSpent, usagePercent, longestSession, freq]
   */
  static analyze(id) {
    let totalTimeSpent = AnalysisDB.getTotalTime(id);
    let usagePercent = AnalysisDB.getUsagePercent(id);
    let longestSession = AnalysisDB.getLongestSession(id);
    // let hourFreq = AnalysisDB.frequency(sessions, "h");
    // let minuteFreq = AnalysisDB.frequency(sessions, "m");
    // let lastNday = AnalysisDB.lastN24HourUsage(sessions);
    let analysis = {
       totalTimeSpent,
       usagePercent,
       longestSession,
    //   hourFreq,
    //   minuteFreq,
    //   lastNday,
     };
    return analysis;
  }

  // USER SESSIONS
  static getTotalTime(id) {
    return db.prepare('SELECT sum(time_spent) as time_spent FROM u'+id).pluck().get(); 
  }

  static getUsagePercent(id) {
    const first = db.prepare('SELECT time_on FROM u'+id+' LIMIT 1').pluck().get();
    const last = db.prepare('SELECT time_off FROM u'+id+' ORDER BY id DESC LIMIT 1').pluck().get();
    return this.getTotalTime(id) / (last - first) * 100;
  }

  static getLongestSession(id) {
    return db.prepare('SELECT max(time_spent) FROM u'+id).pluck().get(); 
  }
  /**
   * Get frequency of sessions based on span (default is hours)
   * @param type h or m
   */
  static frequency(sessions, type) {
    if (sessions.length) {
      var freqs = [];
      var freq = 0;
      var len;
      type == "h" ? (len = 24) : (len = 60);
      for (let i = 0; i < len; i++) {
        for (let j = 0; j < sessions.length; j++) {
          var a = new Date(sessions[j].off);
          type == "h"
            ? a.getHours() == i
              ? freq++
              : null
            : a.getMinutes() == i
            ? freq++
            : null;
        }
        type == "m"
          ? freqs.push({ i: i, minfreq: freq })
          : freqs.push({ i: i, hourfreq: freq });
        freq = 0;
      }

      return freqs;
    } else if (type == "h") return [{ i: 0, hourfreq: 0 }];
    else return [{ i: 0, minfreq: 0 }];
  }

  static mostActiveUsers() {
    
  }

  static lastN24HourUsage(sessions) {
    if (sessions.length) {
      var lastNArray = [];
      var oldest = sessions[0].on;
      var mostRecent = sessions[sessions.length - 1].off;
      var totalTime = Math.floor((mostRecent - oldest) / 86400000);
      if (totalTime) {
        var last24 = mostRecent - 86400000;
        var j = sessions.length - 2;
        for (let i = 0; i < totalTime; i++) {
          var daily = 0;
          while (sessions[j].on > last24) {
            daily += sessions[j].time;
            j--;
          }
          last24 -= 86400000;
          lastNArray.push({ i: i + 1, daily: daily });
        }
      } else return [{ i: 0, daily: this.getTotalTime(sessions) }];
      return lastNArray.reverse();
    } else return [{ i: 0, daily: 0 }];
  }

  static totalTimeSpentAll() {
    return db
      .map((x) => x.sessions)
      .map((y) => y.map((y) => y.time))
      .map((x) => x.reduce((a, b) => a + b, 0))
      .reduce((a,b)=>a+b,0);
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

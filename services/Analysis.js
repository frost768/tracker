class Analysis {
  /**
   * Return analysis of the user sessions
   * @param sessions
   * @description AnalysisArray [totalTimeSpent, usagePercent, longestSession, freq]
   */
  static analyze(sessions) {
    let totalTimeSpent = Analysis.getTotalTime(sessions);
    let usagePercent = Analysis.getUsagePercent(sessions);
    let longestSession = Analysis.getLongestSession(sessions);
    let hourFreq = Analysis.frequency(sessions, "h");
    let minuteFreq = Analysis.frequency(sessions, "m");
    let lastNday = Analysis.lastN24HourUsage(sessions);
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
  static getTotalTime(sessions) {
    return sessions.reduce((acc, s) => acc + s.time, 0);
  }

  static getUsagePercent(sessions) {
    return sessions.length
      ? (this.getTotalTime(sessions) /
          (sessions[sessions.length - 1].off - sessions[0].on)) *
          100
      : 0;
  }

  static getLongestSession(sessions) {
    return sessions.length ? Math.max(sessions.map((x) => x.time)) : 0;
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

  static mostActiveUsers(db) {
    return db
      .map((usr) => {
        return { name: usr.name, tt: Analysis.getTotalTime(usr.sessions) };
      })
      .sort((a, b) => b.tt - a.tt)
      .slice(0, 5);
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

  static totalTimeSpentAll(db) {
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
  Analysis,
};

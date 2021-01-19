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
    let g = db.prepare(`select * from (
    select sum(time_spent) as time_spent from u905388202528 
    union all
    select sum(time_spent) as time_spent from u905343512100
    union all
    select sum(time_spent) as time_spent from u905369107368
    union all
    select sum(time_spent) as time_spent from u905072679824
    union all
    select sum(time_spent) as time_spent from u905074158664
    union all
    select sum(time_spent) as time_spent from u905333471916
    union all
    select sum(time_spent) as time_spent from u905456022597
    union all
    select sum(time_spent) as time_spent from u905532014074
    union all
    select sum(time_spent) as time_spent from u905418221383
    union all
    select sum(time_spent) as time_spent from u905428212349
    union all
    select sum(time_spent) as time_spent from u905077799681
    union all
    select sum(time_spent) as time_spent from u905439464389
    union all
    select sum(time_spent) as time_spent from u905076579898
    union all
    select sum(time_spent) as time_spent from u905433016166
    union all
    select sum(time_spent) as time_spent from u905061009000
    union all
    select sum(time_spent) as time_spent from u905304435099
    union all
    select sum(time_spent) as time_spent from u905316003580
    union all
    select sum(time_spent) as time_spent from u905327890643
    union all
    select sum(time_spent) as time_spent from u905375584811
    union all
    select sum(time_spent) as time_spent from u905362246538
    union all
    select sum(time_spent) as time_spent from u905452002406
    union all
    select sum(time_spent) as time_spent from u905522422140
    union all
    select sum(time_spent) as time_spent from u905357140145
    union all
    select sum(time_spent) as time_spent from u905340608107
    union all
    select sum(time_spent) as time_spent from u905384033898
    union all
    select sum(time_spent) as time_spent from u905446118133
    union all
    select sum(time_spent) as time_spent from u905457435443
    union all
    select sum(time_spent) as time_spent from u905378731379
    union all
    select sum(time_spent) as time_spent from u905547702709
    union all
    select sum(time_spent) as time_spent from u905387746953
    union all
    select sum(time_spent) as time_spent from u905317065280
    union all
    select sum(time_spent) as time_spent from u905424537754
    union all
    select sum(time_spent) as time_spent from u905324450414
    union all
    select sum(time_spent) as time_spent from u905438283610
    union all
    select sum(time_spent) as time_spent from u905388265051
    union all
    select sum(time_spent) as time_spent from u905375506631
    union all
    select sum(time_spent) as time_spent from u905395958057
    union all
    select sum(time_spent) as time_spent from u905071747087
    union all
    select sum(time_spent) as time_spent from u905333841311
    union all
    select sum(time_spent) as time_spent from u905452380048
    union all
    select sum(time_spent) as time_spent from u905348330165
    union all
    select sum(time_spent) as time_spent from u905419662507
    union all
    select sum(time_spent) as time_spent from u905457354921
    union all
    select sum(time_spent) as time_spent from u905448102375
    union all
    select sum(time_spent) as time_spent from u905534664260
    union all
    select sum(time_spent) as time_spent from u905396492682
    union all
    select sum(time_spent) as time_spent from u905418199996
    union all
    select sum(time_spent) as time_spent from u905318560864
    union all
    select sum(time_spent) as time_spent from u905536543888
    union all
    select sum(time_spent) as time_spent from u905467867525
    union all
    select sum(time_spent) as time_spent from u905436139217
    union all
    select sum(time_spent) as time_spent from u905373889394
    union all
    select sum(time_spent) as time_spent from u905349149236
    union all
    select sum(time_spent) as time_spent from u905301422391
    union all
    select sum(time_spent) as time_spent from u905382705009
    union all
    select sum(time_spent) as time_spent from u905343547607
    union all
    select sum(time_spent) as time_spent from u905365879940
    union all
    select sum(time_spent) as time_spent from u905520081801
    union all
    select sum(time_spent) as time_spent from u905372542243
    union all
    select sum(time_spent) as time_spent from u905427318517
    union all
    select sum(time_spent) as time_spent from u905375015892
    union all
    select sum(time_spent) as time_spent from u905379588959
    union all
    select sum(time_spent) as time_spent from u905453903846
    union all
    select sum(time_spent) as time_spent from u905515522087
    union all
    select sum(time_spent) as time_spent from u905537721599
    union all
    select sum(time_spent) as time_spent from u905061120547
    union all
    select sum(time_spent) as time_spent from u905454285060
    union all
    select sum(time_spent) as time_spent from u905432133603
    union all
    select sum(time_spent) as time_spent from u905388743777
    union all
    select sum(time_spent) as time_spent from u905533417599
    union all
    select sum(time_spent) as time_spent from u905313492421
    union all
    select sum(time_spent) as time_spent from u905397102508
    union all
    select sum(time_spent) as time_spent from u905353820499
    union all
    select sum(time_spent) as time_spent from u905051229837
    union all
    select sum(time_spent) as time_spent from u905379946899
    union all
    select sum(time_spent) as time_spent from u905537832720
    union all
    select sum(time_spent) as time_spent from u905534946303
    union all
    select sum(time_spent) as time_spent from u905368558562
    union all
    select sum(time_spent) as time_spent from u905527648004
    union all
    select sum(time_spent) as time_spent from u905533635384
    union all
    select sum(time_spent) as time_spent from u905369355169
    union all
    select sum(time_spent) as time_spent from u905397105942
    union all
    select sum(time_spent) as time_spent from u905385651710
    union all
    select sum(time_spent) as time_spent from u905497983461
    union all
    select sum(time_spent) as time_spent from u905321627357) order by time_spent desc limit 5`).all();
    return g;
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
    let g = db.prepare(`select sum(time_spent) from (
      select sum(time_spent) as time_spent from u905388202528 
      union all
      select sum(time_spent) as time_spent from u905343512100
      union all
      select sum(time_spent) as time_spent from u905369107368
      union all
      select sum(time_spent) as time_spent from u905072679824
      union all
      select sum(time_spent) as time_spent from u905074158664
      union all
      select sum(time_spent) as time_spent from u905333471916
      union all
      select sum(time_spent) as time_spent from u905456022597
      union all
      select sum(time_spent) as time_spent from u905532014074
      union all
      select sum(time_spent) as time_spent from u905418221383
      union all
      select sum(time_spent) as time_spent from u905428212349
      union all
      select sum(time_spent) as time_spent from u905077799681
      union all
      select sum(time_spent) as time_spent from u905439464389
      union all
      select sum(time_spent) as time_spent from u905076579898
      union all
      select sum(time_spent) as time_spent from u905433016166
      union all
      select sum(time_spent) as time_spent from u905061009000
      union all
      select sum(time_spent) as time_spent from u905304435099
      union all
      select sum(time_spent) as time_spent from u905316003580
      union all
      select sum(time_spent) as time_spent from u905327890643
      union all
      select sum(time_spent) as time_spent from u905375584811
      union all
      select sum(time_spent) as time_spent from u905362246538
      union all
      select sum(time_spent) as time_spent from u905452002406
      union all
      select sum(time_spent) as time_spent from u905522422140
      union all
      select sum(time_spent) as time_spent from u905357140145
      union all
      select sum(time_spent) as time_spent from u905340608107
      union all
      select sum(time_spent) as time_spent from u905384033898
      union all
      select sum(time_spent) as time_spent from u905446118133
      union all
      select sum(time_spent) as time_spent from u905457435443
      union all
      select sum(time_spent) as time_spent from u905378731379
      union all
      select sum(time_spent) as time_spent from u905547702709
      union all
      select sum(time_spent) as time_spent from u905387746953
      union all
      select sum(time_spent) as time_spent from u905317065280
      union all
      select sum(time_spent) as time_spent from u905424537754
      union all
      select sum(time_spent) as time_spent from u905324450414
      union all
      select sum(time_spent) as time_spent from u905438283610
      union all
      select sum(time_spent) as time_spent from u905388265051
      union all
      select sum(time_spent) as time_spent from u905375506631
      union all
      select sum(time_spent) as time_spent from u905395958057
      union all
      select sum(time_spent) as time_spent from u905071747087
      union all
      select sum(time_spent) as time_spent from u905333841311
      union all
      select sum(time_spent) as time_spent from u905452380048
      union all
      select sum(time_spent) as time_spent from u905348330165
      union all
      select sum(time_spent) as time_spent from u905419662507
      union all
      select sum(time_spent) as time_spent from u905457354921
      union all
      select sum(time_spent) as time_spent from u905448102375
      union all
      select sum(time_spent) as time_spent from u905534664260
      union all
      select sum(time_spent) as time_spent from u905396492682
      union all
      select sum(time_spent) as time_spent from u905418199996
      union all
      select sum(time_spent) as time_spent from u905318560864
      union all
      select sum(time_spent) as time_spent from u905536543888
      union all
      select sum(time_spent) as time_spent from u905467867525
      union all
      select sum(time_spent) as time_spent from u905436139217
      union all
      select sum(time_spent) as time_spent from u905373889394
      union all
      select sum(time_spent) as time_spent from u905349149236
      union all
      select sum(time_spent) as time_spent from u905301422391
      union all
      select sum(time_spent) as time_spent from u905382705009
      union all
      select sum(time_spent) as time_spent from u905343547607
      union all
      select sum(time_spent) as time_spent from u905365879940
      union all
      select sum(time_spent) as time_spent from u905520081801
      union all
      select sum(time_spent) as time_spent from u905372542243
      union all
      select sum(time_spent) as time_spent from u905427318517
      union all
      select sum(time_spent) as time_spent from u905375015892
      union all
      select sum(time_spent) as time_spent from u905379588959
      union all
      select sum(time_spent) as time_spent from u905453903846
      union all
      select sum(time_spent) as time_spent from u905515522087
      union all
      select sum(time_spent) as time_spent from u905537721599
      union all
      select sum(time_spent) as time_spent from u905061120547
      union all
      select sum(time_spent) as time_spent from u905454285060
      union all
      select sum(time_spent) as time_spent from u905432133603
      union all
      select sum(time_spent) as time_spent from u905388743777
      union all
      select sum(time_spent) as time_spent from u905533417599
      union all
      select sum(time_spent) as time_spent from u905313492421
      union all
      select sum(time_spent) as time_spent from u905397102508
      union all
      select sum(time_spent) as time_spent from u905353820499
      union all
      select sum(time_spent) as time_spent from u905051229837
      union all
      select sum(time_spent) as time_spent from u905379946899
      union all
      select sum(time_spent) as time_spent from u905537832720
      union all
      select sum(time_spent) as time_spent from u905534946303
      union all
      select sum(time_spent) as time_spent from u905368558562
      union all
      select sum(time_spent) as time_spent from u905527648004
      union all
      select sum(time_spent) as time_spent from u905533635384
      union all
      select sum(time_spent) as time_spent from u905369355169
      union all
      select sum(time_spent) as time_spent from u905397105942
      union all
      select sum(time_spent) as time_spent from u905385651710
      union all
      select sum(time_spent) as time_spent from u905497983461
      union all
      select sum(time_spent) as time_spent from u905321627357)`).pluck().get();
    return g;
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

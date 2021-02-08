const Database = require("better-sqlite3");
const db = new Database("./data/deneme.db");
function analyze(id) {
  return {
    totalTime: getUserTotalTime(id),
    usagePercent: getUserUsagePercent(id),
    longestSession: getUserLongestSession(id),
    timeFrequency: getUserTimeFrequency(id),
    dailyUsage: getUserDailyUsage(id),
  };
}

function compareUsers({ id1, id2, min }) {
  if (!min) min = 0;
  const MINIMUM_MINUTE = min * 60;
  let begin,
    end,
    begin_sessions,
    end_sessions,
    encounter = [];
  let u1s = getUserSessions({ id: id1 });
  let u2s = getUserSessions({ id: id2 });
  if (!u1s.length || !u2s.length) return { convo_end: 0, encounter: 0, tt: 0 };

  const usr1_first = u1s[0].time_on;
  const usr2_first = u2s[0].time_on;
  const usr1_last = u1s[u1s.length - 1].time_off;
  const usr2_last = u2s[u2s.length - 1].time_off;
  if (usr1_first > usr2_first) {
    begin = usr1_first;
    begin_sessions = u1s;
  } else {
    begin = usr2_first;
    begin_sessions = u2s;
  }
  if (usr1_last > usr2_last) {
    end = usr2_last;
    end_sessions = u1s.filter((x) => x.time_on < end && x.time_off > begin);
  } else {
    end = usr1_last;
    end_sessions = u2s.filter((x) => x.time_on < end && x.time_off > begin);
  }

  //begin_sessions = u1s;
  //end_sessions = u2s;

  for (var i = 0; i < begin_sessions.length; i++) {
    const u1 = begin_sessions[i];
    end_sessions.forEach((u2) => {
      const impossible =
        (u1.time_on > u2.time_on && u1.time_on > u2.time_off) ||
        (u2.time_on > u1.time_off && u2.time_off > u1.time_off);
      if (impossible) return;
      const u2_entered_in_u1_time =
        u1.time_on < u2.time_on && u2.time_on < u1.time_off;
      const u2_left_in_u1_time =
        u1.time_on < u2.time_off && u2.time_off < u1.time_off;
      const u2_in_u1 = u2_entered_in_u1_time && u2_left_in_u1_time;
      const u2_left_after_u1 =
        u2_entered_in_u1_time && u2.time_off > u1.time_off;
      const u2_entered_and_left_first =
        u2.time_on < u1.time_on && u2_left_in_u1_time;
      // let u2_entered_before_u1 = !u2_entered_in_u1_time && u2.time_on < u1.time_on;
      // let U1JoinAndU2LeavesBefore = u2_entered_before_u1 && (u1.time_on < u2.time_off && u1.time_on > u2.time_on);
      const u1date = new Date(u1.time_on).toLocaleString("tr");
      const u2date = new Date(u2.time_off).toLocaleString("tr");
      const day = { u1date, u2date };

      if (u2_in_u1) {
        const time = parseInt(u2.time_spent / 1000);
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
  }

  const convo_end = encounter.length;
  const tt = encounter.reduce((a, b) => a + b.time, 0);
  const proportion = tt / convo_end;
  return { convo_end, encounter, tt, proportion };
}

function compareUsersSQL({ id1, id2, min }) {
  const temp_u1 = `CREATE TEMP TABLE u1 AS SELECT * FROM sessions WHERE user_id = ${id1}`;
  const temp_u2 = `CREATE TEMP TABLE u2 AS SELECT * FROM sessions WHERE user_id = ${id2}`;
  let u2_in_u1 = `SELECT (u2.time_spent / 1000) AS time FROM u1 , u2
     WHERE 
        (u2.time_on BETWEEN u1.time_on AND u1.time_off) AND 
        (u2.time_off BETWEEN u1.time_on AND u1.time_off)`;

  let u2_left_after_u1 = `SELECT (u1.time_off - u2.time_on) / 1000 AS time FROM u1 , u2
     WHERE 
        (u2.time_on between u1.time_on AND u1.time_off) AND 
        u2.time_off > u1.time_off`;

  let u2_entered_and_left_first = `SELECT (u1.time_off - u2.time_on) / 1000 AS time FROM u1, u2
     WHERE 
        (u2.time_off between u1.time_on AND u1.time_off) AND 
        u2.time_on < u1.time_on`;

  if (min) {
    u2_in_u1 += ` AND time > ${min};`;
    u2_left_after_u1 += ` AND time > ${min};`;
    u2_entered_and_left_first += ` AND time > ${min};`;
  } else {
    u2_in_u1 += ";";
    u2_left_after_u1 += ";";
    u2_entered_and_left_first += ";";
  }

  db.prepare(temp_u1).run();
  db.prepare(temp_u2).run();
  const u2_in_u1_result = db.prepare(u2_in_u1).all();
  const u2_left_after_u1_result = db.prepare(u2_left_after_u1).all();
  const u2_entered_and_left_first_result = db
    .prepare(u2_entered_and_left_first)
    .all();
  return [
    u2_in_u1_result,
    u2_left_after_u1_result,
    u2_entered_and_left_first_result,
  ];
}

function getUserSessions({ id, name, from, to }) {
  from = Date.parse(from);
  to = Date.parse(to);
  let query = `SELECT time_on, time_off, time_spent FROM sessions WHERE user_id = ${id}`;
  if (from) query += ` AND time_on > ${from}`;
  if (to) query += ` AND time_on < ${to}`;
  return db.prepare(query).all();
}

function getUserTotalTime({ id }) {
  return db
    .prepare(`SELECT SUM(time_spent) AS tt FROM sessions WHERE user_id = ${id}`)
    .pluck()
    .get();
}

function getUserUsagePercent({ id }) {
  return db
    .prepare(
      `SELECT (SUM(time_spent) * 1.0 / (MAX(time_off) - MIN(time_on))) * 100 AS percent 
       FROM sessions WHERE user_id = ${id}`
    )
    .pluck()
    .get();
}

function getUserLongestSession({ id }) {
  return db
    .prepare(
      `SELECT DATETIME(time_on / 1000, 'unixepoch','localtime') AS day, MAX(time_spent) AS duration FROM sessions WHERE user_id = ${id}`
    )
    .get();
}

function getUserTimeFrequency({ id }) {
  const hours = `SELECT count(*)   AS frequency, STRFTIME('%H',time_on / 1000, 'unixepoch', 'localtime')    AS hour   FROM sessions WHERE user_id = ${id} GROUP BY hour   ORDER BY frequency DESC;`;
  const minutes = `SELECT count(*) AS frequency, STRFTIME('%M',time_on / 1000, 'unixepoch', 'localtime')    AS minute FROM sessions WHERE user_id = ${id} GROUP BY minute ORDER BY frequency DESC;`;
  const times = `SELECT count(*)   AS frequency, STRFTIME('%H:%M',time_on / 1000, 'unixepoch', 'localtime') AS time   FROM sessions WHERE user_id = ${id} GROUP BY time   ORDER BY frequency DESC;`;
  const hours_result = db.prepare(hours).all();
  const minutes_result = db.prepare(minutes).all();
  const times_result = db.prepare(times).all();
  return { hours_result, minutes_result, times_result };
}

function getUserDailyUsage({ id }) {
  return db
    .prepare(
      `SELECT
      SUM(time_spent) AS tt,
      DATE(time_on / 1000, 'unixepoch', 'localtime') AS day
      FROM sessions
      WHERE user_id = ${id}
      GROUP BY day;`
    )
    .all();
}

function totalTimeSpent() {
  return db.prepare("SELECT SUM(time_spent) FROM sessions").pluck().get();
}

function dailyUsage() {
  return db
    .prepare(
      `SELECT
      SUM(time_spent) AS tt,
      DATE(time_on / 1000, 'unixepoch', 'localtime') AS day
      FROM sessions
      GROUP BY day;`
    )
    .all();
}

function mostActiveUsers() {
  return db
    .prepare(
      "SELECT user_id AS id, SUM(time_spent) AS tt FROM sessions GROUP BY id ORDER BY tt DESC LIMIT 5"
    )
    .all();
}

module.exports = {
  analyze,
  compareUsers,
  getUserSessions,
  getUserTotalTime,
  getUserUsagePercent,
  getUserLongestSession,
  getUserTimeFrequency,
  getUserDailyUsage,
  totalTimeSpent,
  dailyUsage,
  mostActiveUsers,
};

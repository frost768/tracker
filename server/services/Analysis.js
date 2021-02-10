const Database = require('better-sqlite3');
const db = new Database('./data/deneme.db', { readonly: true });
function analyze(id) {
  return {
    totalTime: getUserTotalTime(id),
    usagePercent: getUserUsagePercent(id),
    longestSession: getUserLongestSession(id),
    timeFrequency: getUserTimeFrequency(id),
    dailyUsage: getDailyUsage(id),
  };
}

/**
 * @param {Object} query - Query for comparing
 * @param {number} query.id1 - First user to be compared
 * @param {number} query.id2 - Second user to be compared
 * @param {number} [query.min] - Take less then this minutes into account
 * @returns {Comparison[]} Comparison of the users' sessions
 */
function compareUsers(query) {
  const { id1, id2, min = 0 } = query;
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

  begin_sessions = u1s;
  end_sessions = u2s;

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
      const u1date = new Date(u1.time_on).toLocaleString('tr');
      const u2date = new Date(u2.time_off).toLocaleString('tr');
      const day = { u1date, u2date };

      if (u2_in_u1) {
        const time = parseInt(u2.time_spent / 1000);
        if (time <= MINIMUM_MINUTE) return;
        encounter.push({ day, time });
      }
      if (u2_left_after_u1) {
        const time = parseInt((u1.time_off - u2.time_on) / 1000);
        if (time <= MINIMUM_MINUTE) return;
        encounter.push({ day, time });
      }
      if (u2_entered_and_left_first) {
        const time = parseInt((u2.time_off - u1.time_on) / 1000);
        if (time <= MINIMUM_MINUTE) return;
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
    u2_in_u1 += ';';
    u2_left_after_u1 += ';';
    u2_entered_and_left_first += ';';
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

/**
 * @param {Object} query - Query for the sessions
 * @param {number} query.id - User id
 * @param {Date|string} [query.from] - From this date
 * @param {Date|string} [query.to]  - To this date
 * @param {number} [query.minute_limit] -  Lower limit for spent time
 * @returns {Session[]} Sessions of a user
 */
function getUserSessions(query) {
  let { id, from, to, minute_limit } = query;
  from = Date.parse(from);
  to = Date.parse(to);
  let sql_query = `SELECT time_on, time_off, (time_spent / 1000) as time_spent FROM sessions WHERE user_id = ${id}`;
  if (from) sql_query += ` AND time_on > ${from}`;
  if (to) sql_query += ` AND time_on < ${to}`;
  if (minute_limit) sql_query += ` AND time_spent > ${minute_limit} * 60`
  return db.prepare(sql_query).all();
}

/** 
 * Returns user's total time spent in seconds
 * @param {Object} id
 * @param {number} id.id
 * @returns {number} tt
 */
function getUserTotalTime({ id }) {
  return db
    .prepare(`SELECT SUM(time_spent / 1000) AS tt FROM sessions WHERE user_id = ${id}`)
    .pluck()
    .get();
}

/** 
 * Returns usage percentage of a user 
 * 
 * Calculated as total time divided by first session subtracted from last one
 * 
 * total_time / (last_session - first_session)
 * @param {Object} id
 * @param {number} id.id
 * @returns {number} percent
 */
function getUserUsagePercent({ id }) {
  return db
    .prepare(
      `SELECT (SUM(time_spent) * 1.0 / (MAX(time_off) - MIN(time_on))) * 100 AS percent 
       FROM sessions WHERE user_id = ${id}`
    )
    .pluck()
    .get();
}

/**
 * @param {Object} id User object
 * @param {number} id.id User id
 * @returns {{day:string,duration:number}} The day and duration of user's longest session
 */
function getUserLongestSession({ id }) {
  return db
    .prepare(
      `SELECT DATETIME(time_on / 1000, 'unixepoch','localtime') AS day, MAX(time_spent / 1000) AS duration FROM sessions WHERE user_id = ${id}`
    )
    .get();
}

/** 
 * Returns frequencies of hours, minutes and time (H:m)
 * @param {Object} id
 * @param {number} id.id
 * @returns {Frequency} result
 */
function getUserTimeFrequency({ id }) {
  const hours = `SELECT count(*)   AS frequency, STRFTIME('%H',time_on / 1000, 'unixepoch', 'localtime')    AS hour   FROM sessions WHERE user_id = ${id} GROUP BY hour  ;`;
  const minutes = `SELECT count(*) AS frequency, STRFTIME('%M',time_on / 1000, 'unixepoch', 'localtime')    AS minute FROM sessions WHERE user_id = ${id} GROUP BY minute;`;
  const times = `SELECT count(*)   AS frequency, STRFTIME('%H:%M',time_on / 1000, 'unixepoch', 'localtime') AS time   FROM sessions WHERE user_id = ${id} GROUP BY time  ;`;
  const hour_frequencies = db.prepare(hours).all();
  const minute_frequencies = db.prepare(minutes).all();
  const time_frequencies = db.prepare(times).all();
  return { hour_frequencies, minute_frequencies, time_frequencies };
}

/** 
 * Returns daily usages of a user
 * @param {Object} id
 * @param {number} id.id
 * @returns {DailyUsage[]} Statistics of every day
 */
function getDailyUsage(id) {
  let query = 
  `SELECT
    AVG(time_spent / 1000) AS avg,
    COUNT(*) AS times,
    SUM(time_spent / 1000) AS tt,
    DATE(time_on / 1000, 'unixepoch', 'localtime') AS day
    FROM sessions`
    if(id) query += ` WHERE user_id = ${id.id}`
    query += ' GROUP BY day;'
  return db
    .prepare(query)
    .all();
}
/** 
 * Returns total time spent in seconds
 * @returns {number}
 */
function totalTimeSpent() {
  return db.prepare('SELECT SUM(time_spent / 1000) FROM sessions').pluck().get();
}

/** 
 * Returns five most active users by their spent time in seconds in descending order
 * @returns {{ id:number, tt:number }[]}
 */
function mostActiveUsers() {
  return db
    .prepare(
      'SELECT user_id AS id, SUM(time_spent / 1000) AS tt FROM sessions GROUP BY id ORDER BY tt DESC LIMIT 5'
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
  getDailyUsage,
  totalTimeSpent,
  mostActiveUsers,
};

/**
 * @typedef Session 
 * @property {number} time_on - Beginning of a session
 * @property {number} time_off - End of a session
 * @property {number} time_spent - Duration of a session
*/

/**  
 * @typedef Encounter 
 * @property {string} day - Day of the encounter
 * @property {number} time - Duration of the encounter
 * 
*/

/**  
 * @typedef Comparison 
 * @property {number} convo_end - Count of encounters
 * @property {Encounter[]} encounter - Encounters of the users
 * @property {number} tt - Total time of encounters
 * @property {number} proportion - Total time divided by count of encounters
*/

/**
 * @typedef Frequency
 * @property {{frequency:number, hour:string}[]} hour_frequencies Frequencies of hours
 * @property {{frequency:number, minute:string}[]} minute_frequencies
 * @property {{frequency:number, time:string}[]} time_frequencies
 */

 /**
  * @typedef DailyUsage
  * @property {number} avg Average usage of the day
  * @property {number} times 
  * @property {number} tt Total usage in minutes
  * @property {string} day
  */
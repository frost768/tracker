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
 * @returns {Comparison} Comparison of the users' sessions
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
  console.log('id1', id1);
  console.log('id2', id2);
  console.log('begin_sessions length', begin_sessions.length);
  console.log('end_sessions length', end_sessions.length);
  console.time('Comparison took')
  // begin_sessions = u1s;
  // end_sessions = u2s;

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
      const u1on  = new Date(u1.time_on).toLocaleString('tr');
      const u1off = new Date(u1.time_off).toLocaleString('tr');
      const u2on  = new Date(u2.time_on).toLocaleString('tr');
      const u2off = new Date(u2.time_off).toLocaleString('tr');
      const day = { 
        u1on,
        u1off,
        u2on,
        u2off 
      };

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
  console.timeEnd('Comparison took')
  const convo_end = encounter.length;
  const tt = encounter.reduce((a, b) => a + b.time, 0);
  const proportion = tt / convo_end;
  return { convo_end, encounter, tt, proportion };
}

function compareUsersSQL({ id1, id2, min = 0 }) {
  const sql = `WITH borders AS
  (SELECT user_id, MAX(ton) AS beg, MIN(toff) AS en FROM
  (SELECT  
  user_id,
  MIN(time_on) AS ton, 
  MAX(time_off) AS toff
  FROM sessions 
  WHERE 
      user_id = ${id1} 
      or 
      user_id = ${id2} 
  GROUP BY 
      user_id
  )),
  
  temps AS (SELECT 
  sessions.user_id AS u,sessions.time_on AS ton,
  sessions.time_off AS toff, sessions.time_spent AS ts
  FROM 
  sessions,borders 
  WHERE  
  time_on > borders.beg AND 
  time_off < borders.en AND 
  sessions.user_id = ${id1} OR 
  sessions.user_id = ${id2})
  
  SELECT 
  datetime(u1ton / 1000, 'unixepoch', 'localtime') AS u1on,
  datetime(u1toff / 1000, 'unixepoch', 'localtime') AS u1off,
  datetime(u2ton / 1000, 'unixepoch', 'localtime') AS u2on,
  datetime(u2toff / 1000, 'unixepoch', 'localtime') AS u2off,
  CASE 
      WHEN (u2ton BETWEEN u1ton AND u1toff) AND (u2toff BETWEEN u1ton AND u1toff)
      THEN ts2 / 1000
      WHEN (u1ton BETWEEN u2ton AND u2toff) AND (u1toff BETWEEN u2ton AND u2toff)
      THEN ts1 / 1000
      WHEN (u2toff BETWEEN u1ton AND u1toff) AND u2ton < u1ton
      THEN (u2toff - u1ton) * 1.0 / 1000
      WHEN (u2ton BETWEEN u1ton AND u1toff) AND u2toff > u1toff
      THEN (u1toff - u2ton) * 1.0 / 1000
      ELSE 0
      END
      AS time
   FROM (
  (SELECT ton AS u1ton, toff AS u1toff, ts AS ts1 FROM temps WHERE u = ${id1}) AS u1,
  (SELECT ton AS u2ton, toff AS u2toff, ts AS ts2  FROM temps WHERE u = ${id2}) AS u2
  ) where time > ${min};`
  console.log(id1, id2);
  console.time('Comparison took')
  const encounter = db.prepare(sql).all();
  console.timeEnd('Comparison took')
  const convo_end = encounter.length;
  const tt = encounter.reduce((a, b) => a + b.time, 0);
  const proportion = tt / convo_end;
  return { convo_end, encounter, tt, proportion };
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
    AVG(time_spent) / 1000 AS avg,
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
      'SELECT user_id AS id, SUM(time_spent / 1000) AS tt FROM sessions GROUP BY user_id ORDER BY tt DESC LIMIT 5'
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
  compareUsersSQL,
};

/**
 * @typedef Session 
 * @property {number} time_on - Beginning of a session
 * @property {number} time_off - End of a session
 * @property {number} time_spent - Duration of a session
*/

/**  
 * @typedef Encounter 
 * @property {Object} day - Days of the encounter
 * @property {string} day.u1date - User 1 date time of the encounter
 * @property {string} day.u2date - User 2 date time of the encounter
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
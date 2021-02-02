const { writeFileSync } = require('fs');
const Database = require("better-sqlite3");
const db = new Database("./data/deneme.db");
json_db = require("./data/db.json");
console.log("Creating DB if it doesnt exist...");
db.prepare('DROP TABLE IF EXISTS sessions;').run();
db.prepare(`CREATE TABLE sessions 
        (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id VARCHAR(12),
          user_tag VARCHAR(10),
          time_on DATETIME,
          time_off DATETIME,
          time_spent INTEGER
        );`
).run();
console.time('timer')
console.log("Adding records to DB...")
json_db.forEach(user  => {
  let table = `INSERT INTO sessions 
  (
    user_id,
    user_tag,
    time_on,
    time_off,
    time_spent) VALUES `;
  for (let i = 0; i < user.sessions.length; i++) {
    let h = user.sessions[i];
    if (i < user.sessions.length - 1) {
      let hh = `(${user.id},'${user.tag}',${h.on},${h.off},${h.time}),`;
      table += hh;
    } else {
      h = user.sessions[user.sessions.length - 1];
      let gg= `(${user.id},'${user.tag}',${h.on},${h.off},${h.time});`;
      table += gg;
    }
  }
  db.prepare(table).run();
});
console.log("Done!!")
console.timeEnd('timer')
let id_tag_db= db.prepare('SELECT user_id, user_tag from sessions group by user_id').all();
var id_tag = {};
id_tag_db.map(x=> { 
  id_tag[x.user_id] = x.user_tag
})
writeFileSync('./data/id_tag.json',JSON.stringify(id_tag));
db.close()

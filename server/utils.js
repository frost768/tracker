const fs = require('fs');
const Database = require('better-sqlite3');
const dbsql = new Database('./data/deneme.db');
const id_tag = require('./data/id_tag.json');

function checkTempJson() {
  var temp = './data/temp.json';
  let users = [];
  if (fs.existsSync(temp)) {
    var file;
    try {
      file = fs.readFileSync(temp, { encoding: 'utf-8' });
      JSON.parse(file);
    } catch {
      console.log('Dosya bozuk. Array yazılıyor...');
      fs.writeFileSync(temp, JSON.stringify([], null));
      file = fs.readFileSync(temp, { encoding: 'utf-8' });
    }
    if (JSON.parse(file).length) {
      console.log('Eski kayıtlar bulundu. Geri yükleniyor...');
      users = JSON.parse(file);
    } else console.log('Eski kayıt yok....');
  }
  
  return users;
}

const insert = dbsql.prepare('INSERT INTO sessions (user_id, user_tag, time_on, time_off, time_spent) VALUES (@id, @tag, @time_on, @time_off, @time_spent);');
function sessionLogger(json, users) {
  const { id, type } = json;
  var num = id.substr(0, 12);
  var usr_found = users.find(x => x[0] == num);
  var not_in_users_but_online = !usr_found && type == 'available';
  var in_users_and_got_offline = usr_found && type == 'unavailable';
  if (not_in_users_but_online) {
    var usr = [num, Date.now()];
    users.push(usr);
    console.log('-------|' + new Date().toLocaleString('tr') + '|--------');
    users.forEach(u => {
      console.log(
        '|| • ' + u[0] + '\t||' + new Date(u[1]).toLocaleTimeString('tr')
      );
    });
    console.log('-------|' + users.length + '/' + 68 + '|--------');
    fs.writeFileSync('./data/temp.json', JSON.stringify(users, null));
  }

  if (in_users_and_got_offline) {
    // Update users[] array
    users = users.filter(x => x[0] != usr_found[0]);

    // Add offline time
    usr_found.push(Date.now());
    
    let time_spent = usr_found[2] - usr_found[1];
    let session = {
      id: usr_found[0].toString(), 
      tag: id_tag[usr_found[0]],
      time_on: usr_found[1], 
      time_off: usr_found[2],
      time_spent
    }
    insert.run(session)
    console.log(
      '| × ' + usr_found[0],
      '||',
      new Date(time_spent).toLocaleTimeString('tr'),
      '||',
      new Date(usr_found[2]).toLocaleString('tr')
    );
    fs.writeFileSync('./data/temp.json', JSON.stringify(users, null));

    usr_found = undefined;
  }
  if (type == 'composing') console.log(usr_found[0], 'yazıyor');

  return users;
}

const insertTG = dbsql.prepare('INSERT INTO tg_sessions (user_id, user_tag, time_on, time_off, time_spent) VALUES (@id, @tag, @time_on, @time_off, @time_spent);');
function tgSessionLogger(json, users) {
    const { id, tag, name, type } = json;
    var usr_found = users.find(x => x[1] == id);
    var not_in_users_but_online = !usr_found && type == 'available';
    var in_users_and_got_offline = usr_found && type == 'unavailable';
    if (not_in_users_but_online) {
      var usr = [name, id, Date.now()];
      users.push(usr);
      console.log('TG-Logger');
      console.log('-------|' + new Date().toLocaleString('tr') + '|--------');
      users.forEach(u => {
      console.log(
        '|| • ' + u[0] + '\t||' + new Date(u[2]).toLocaleTimeString('tr')
        );
      });
      console.log('-------|' + users.length + '/' + 68 + '|--------');
      console.log('TG-Logger');
    }

    if (in_users_and_got_offline) {
      // Update users[] array
      users = users.filter(x => x[1] != usr_found[1]);

      // Add offline time
      usr_found.push(Date.now());
      let time_spent = usr_found[3] - usr_found[2]
      // Add session to DB and return timespent formatted
      let session = {
        id: usr_found[1].toString(), 
        tag,
        time_on: usr_found[2], 
        time_off: usr_found[3],
        time_spent
      }
      insertTG.run(session)

      console.log(
        '| × ' + json.name,
        '||',
        new Date(time_spent).toLocaleTimeString('tr'),
        '||',
        new Date(usr_found[3]).toLocaleString('tr')
      );

      usr_found = undefined;
    }

    return users;
}

module.exports = {
    sessionLogger,
    checkTempJson,
    tgSessionLogger
}
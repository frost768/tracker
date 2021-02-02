const fs = require("fs");
const Database = require('better-sqlite3');
const db2 = new Database('./data/deneme.db');
const id_tag = require('./data/id_tag.json');
var first = "./data/db.json";
var second = "./data/data/db.json";
var bkp = "./data/bkp/";
var files = [first, second];
var db = undefined;
function readDB(){
  var mtime = 0;
	fs.readdirSync(bkp).sort((a, b) => 
	 fs.statSync(bkp + b).mtimeMs - fs.statSync(bkp + a).mtimeMs
	).forEach(x => files.push(bkp + x))
	
	let h = 0
	for (let i = 0; i < files.length; i++) {
	  const file = files[i];
	  try {
	        h++;
	        console.log(file)
	        db = fs.readFileSync(file, "utf-8");
	        mtime = fs.statSync(file).mtimeMs;
	        db = JSON.parse(db);

	        if (db) {
		    console.log(new Date(mtime).toLocaleString(), "tarihli dosya yüklendi.");
	            break;
        	}
        }catch {
        	console.error(h, ".DB Bozuk: Son kayıt ", new Date(mtime));
    	}
  }
}
let deleteAt = -1;

function addSession(usr) {
  deleteAt += 1;
  if (deleteAt == 5) {
    console.log("Siliniyor..");
    files = [];
    fs.readdirSync(bkp)
      .sort((a, b) => {
        return fs.statSync(bkp + b).mtimeMs - fs.statSync(bkp + a).mtimeMs;
      })
      .forEach((x) => files.push(bkp + x));
    files.slice(20).forEach((y) =>
      fs.unlink(y, (err) => {
        err ? console.log(err) : console.log(y, "silindi");
      })
    );
    deleteAt = 0;
  }

  let contact = db.find((a) => a.id == usr[0]);
  if (contact) {
    contact.sessions.push({ on: usr[1], off: usr[2], time: usr[2] - usr[1] });
  } else {
    let u = { id: usr[0], tag: "bilinmiyor", name: usr[0], sessions: [] };
    u.sessions.push({ on: usr[1], off: usr[2], time: usr[2] - usr[1] });
    db.push(u);
  }
  fs.copyFile(first, second, fs.constants.COPYFILE_FICLONE, (err) => {
    err ? console.log(err) : console.log("DB copied");
  });

  fs.copyFile(
    first,
    bkp + "db" + Date.now() + ".json",
    fs.constants.COPYFILE_EXCL,
    (err) => {
      if (err) console.log("Error" + err);
      //else console.log('Backed up')
    }
  );

  fs.writeFile(first, JSON.stringify(db), function (err) {
    if (err) console.log(err);
    else {
      console.log("| -> Saved");
    }
  });

  return usr[2] - usr[1];
}

function checkTempJson() {
  var temp = "./data/temp.json";
  let users = [];
  if (fs.existsSync(temp)) {
    var file;
    try {
      file = fs.readFileSync(temp, { encoding: "utf-8" });
      JSON.parse(file);
    } catch {
      console.log("Dosya bozuk. Array yazılıyor...");
      fs.writeFileSync(temp, JSON.stringify([], null));
      file = fs.readFileSync(temp, { encoding: "utf-8" });
    }
    if (JSON.parse(file).length) {
      console.log("Eski kayıtlar bulundu. Geri yükleniyor...");
      users = JSON.parse(file);
    } else console.log("Eski kayıt yok....");
  }
  
  return users;
}

const insert = db2.prepare("INSERT INTO sessions (user_id, user_tag, time_on, time_off, time_spent) VALUES (@id, @tag, @time_on, @time_off, @time_spent);");
function sessionLogger(json, users) {
  var num = json.id.substr(0, 12);
  var usr_found = users.find((elem) => elem[0] == num);
  var not_in_users_but_online = !usr_found && json.type == "available";
  var in_users_and_got_offline = usr_found && json.type == "unavailable";
  if (not_in_users_but_online) {
    var usr = [num, Date.now()];
    users.push(usr);
    console.log("-------|" + new Date().toLocaleString("tr") + "|--------");
    users.forEach((u) => {
      console.log(
        "|| • " + u[0] + "\t||" + new Date(u[1]).toLocaleTimeString("tr")
      );
    });
    console.log("-------|" + users.length + "/" + 68 + "|--------");
    fs.writeFileSync("./data/temp.json", JSON.stringify(users, null));
  }

  if (in_users_and_got_offline) {
    // Update users[] array
    users = users.filter((elem) => elem[0] != usr_found[0]);

    // Add offline time
    usr_found.push(Date.now());

    // Add session to DB and return timespent formatted
    let timespent = addSession(usr_found);
    let session = {
      id: usr_found[0].toString(), 
      tag: id_tag[usr_found[0]],
      time_on: usr_found[1], 
      time_off: usr_found[2],
      time_spent: timespent
    }
    insert.run(session)
    console.log(
      "| × " + usr_found[0],
      "||",
      new Date(timespent).toLocaleTimeString("tr"),
      "||",
      new Date(usr_found[2]).toLocaleString("tr")
    );
    fs.writeFileSync("./data/temp.json", JSON.stringify(users, null));

    usr_found = undefined;
  }
  if (json.type == "composing") console.log(usr_found[0], "yazıyor");

  return users;
}

function tgSessionLogger(json,users) {
    var usr_found = users.find((elem) => elem[1] == json.id);
    var not_in_users_but_online = !usr_found && json.type == "available";
    var in_users_and_got_offline = usr_found && json.type == "unavailable";
    if (not_in_users_but_online) {
      var usr = [json.name, json.id, Date.now()];
      users.push(usr);
      console.log("TG-Logger");
      console.log("-------|" + new Date().toLocaleString("tr") + "|--------");
      users.forEach((u) => {
      console.log(
        "|| • " + u[0] + "\t||" + new Date(u[2]).toLocaleTimeString("tr")
        );
      });
      console.log("-------|" + users.length + "/" + 68 + "|--------");
      console.log("TG-Logger");

    }

    if (in_users_and_got_offline) {
      // Update users[] array
      users = users.filter((elem) => elem[1] != usr_found[1]);

      // Add offline time
      usr_found.push(Date.now());
      let timespent = usr_found[3] - usr_found[2]
      // Add session to DB and return timespent formatted
      let session = {
        id: usr_found[1].toString(), 
        tag: id_tag[usr_found[1]],
        time_on: usr_found[2], 
        time_off: usr_found[3],
        time_spent: timespent
      }
      insert.run(session)

      console.log(
        "| × " + json.name,
        "||",
        new Date(timespent).toLocaleTimeString("tr"),
        "||",
        new Date(usr_found[3]).toLocaleString("tr")
      );

      usr_found = undefined;
      return users;
    }
}

module.exports = {
    readDB,
    sessionLogger,
    checkTempJson,
    tgSessionLogger
}
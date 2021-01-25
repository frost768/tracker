const WA = require("@adiwajshing/baileys");
const { WAConnection, ReconnectMode } = WA;
const WebSocket = require("ws");
const { EventEmitter } = require("events");
const {
  copyFile,
  readFileSync,
  writeFile,
  writeFileSync,
  existsSync,
  constants,
  statSync,
  readdirSync,
  unlink,
} = require("fs");

const names = require("./data/names.json");

var first = "./data/db.json";
var temp = "./data/temp.json";
var second = "./data/data/db.json";
var bkp = "./data/bkp/";
var mtime = 0;
var files = [first, second];

let db = undefined;
function readDB(){ 
	readdirSync(bkp).sort((a, b) => 
	 statSync(bkp + b).mtimeMs - statSync(bkp + a).mtimeMs
	).forEach(x => files.push(bkp + x))
	
	let h = 0
	for (let i = 0; i < files.length; i++) {
	  const file = files[i];
	  try {

	        h++;
	        console.log(file)
	        db = readFileSync(file, "utf-8");
	        mtime = statSync(file).mtimeMs;
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

readDB()

const client = new WAConnection();
const wss = new WebSocket.Server({ port: 8081 });

async function main() {
  client.autoReconnect = ReconnectMode.off;
  client.loadAuthInfo("./data/auth_info.json");
  await client.connect();
  client.on("credentials-updated", (auth) =>
    writeFileSync("./data/auth_info.json", JSON.stringify(auth, null, "\t"))
  );
  await sendRequest();
}

main().catch((x) => console.log(x));


const timer = (ms) => new Promise((res) => setTimeout(res, ms));
let deleteAt = -1;

function addSession(usr) {
  deleteAt += 1;
  if (deleteAt == 5) {
    console.log("Siliniyor..");
    files = [];
    readdirSync(bkp)
      .sort((a, b) => {
        return statSync(bkp + b).mtimeMs - statSync(bkp + a).mtimeMs;
      })
      .forEach((x) => files.push(bkp + x));
    files.slice(20).forEach((y) =>
      unlink(y, (err) => {
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
  copyFile(first, second, constants.COPYFILE_FICLONE, (err) => {
    err ? console.log(err) : console.log("DB copied");
  });

  copyFile(
    first,
    bkp + "db" + Date.now() + ".json",
    constants.COPYFILE_EXCL,
    (err) => {
      if (err) console.log("Error" + err);
      //else console.log('Backed up')
    }
  );

  writeFile(first, JSON.stringify(db), function (err) {
    if (err) console.log(err);
    else {
      console.log("| -> Saved");
    }
  });

  return usr[2] - usr[1];
}

function add_Session(user) {
  const id = user[0];
  const on = user[1];
  const off = user[2];
  const time = off - on;
  const stmt = db.prepare(
    `INSERT INTO u${id} (time_on,time_off,time_spent) VALUES (${on}, ${off},${time})`
  );
  return stmt.run();
}

function checkTempJson() {
  var users = [];
  if (existsSync(temp)) {
    var file;
    try {
      file = readFileSync(temp, { encoding: "utf-8" });
      JSON.parse(file);
    } catch {
      console.log("Dosya bozuk. Array yazılıyor...");
      writeFileSync(temp, JSON.stringify([], null));
      file = readFileSync(temp, { encoding: "utf-8" });
    }
    if (JSON.parse(file).length) {
      console.log("Eski kayıtlar bulundu. Geri yükleniyor...");
      users = JSON.parse(file);

      console.log("Şu kayıtlar geri yüklendi:");
      logOnline(users, "/");
    } else console.log("Eski kayıt yok....");
  }

  return users;
}

var users = checkTempJson();

function sessionLogger(json, users) {
  var num = json.id.substr(0, 12);
  var usr_found = users.find((elem) => elem[0] == num);
  let name = "";
  let n = names.find((x) => x.id == num);
  if (n) name = n.name;
  else name = "bilinmiyor";
  var usr_name = name;
  var not_in_users_but_online = !usr_found && json.type == "available";
  var in_users_and_got_offline = usr_found && json.type == "unavailable";
  if (not_in_users_but_online) {
    var usr = [num, Date.now()];
    users.push(usr);
    logOnline(users, "|");
    // client.sendMessage ("905343547607@s.whatsapp.net", usr_name + ' online' , MessageType.text)
    writeFileSync("./data/temp.json", JSON.stringify(users, null));
  }

  if (in_users_and_got_offline) {
    // Update users[] array
    users = users.filter((elem) => elem[0] != usr_found[0]);

    // Add offline time
    usr_found.push(Date.now());

    // Add session to DB and return timespent formatted
    let timespent = addSession(usr_found);
    logOnline(users, "|");
    console.log(
      "| × " + usr_name,
      "||",
      new Date(timespent).toLocaleTimeString("tr"),
      "||",
      new Date(usr_found[2]).toLocaleString("tr")
    );
    writeFileSync("./data/temp.json", JSON.stringify(users, null));
    //client.sendMessage ("905343547607@s.whatsapp.net", User.getName(usr_found[0]) + ' offline' , MessageType.text)
    usr_found = undefined;
  }
  if (json.type == "composing") console.log(usr_name, "yazıyor");

  return users;
}

async function sendRequest() {
  const namesLength = names.length;
  let requests = [];
  for (let i = 0; i < namesLength; i += 1) {
      client.getProfilePicture(names[i].id + "@c.us")
      .then(data => names[i].pp = data)
      .catch(err => console.log(names[i].name,err.status))
      
      requests.push(timer(100).then(() => client.requestPresenceUpdate(names[i].id + "@c.us")))
  }
  await Promise.all(requests).then(()=> writeFileSync('./data/names.json', JSON.stringify(names, null, '\t')))
}

function logOnline(arr, b) {
  console.log("-------|" + new Date().toLocaleString("tr") + "|--------");
  arr.forEach((u) => {
    let n = names.find((x) => x.id == u[0]);
    let name = "";
    if (n) name = n.name;
    else name = "bilinmiyor";
    console.log(
      b + "| • " + name + "\t||" + new Date(u[1]).toLocaleTimeString("tr")
    );
  });
  console.log("-------|" + arr.length + "/" + names.length + "|--------");
}

let a = new EventEmitter();
wss.on("connection", (socket, req) => {
  a.on("send", (args) => {
    socket.send(JSON.stringify(args));
  });

  socket.on('close',()=>{
      console.log('cikti')
  })
});


client.on("user-presence-update", (json) => {
  users = sessionLogger(json, users);
  a.emit("send", json);
});

client.on("close", async (reason) => {
  if (reason.reason === "close" || "lost") {
    // uncomment to reconnect whenever the connection gets taken over from somewhere else
    await client.connect();
    await sendRequest();
  } else {
    console.log("oh no got disconnected: " + reason.reason);
  }
});

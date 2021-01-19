import { User, names } from '../models/User';
import { Analysis } from './Analysis';
import { Session } from '../models/Session';
import { readFile, copyFile, readFileSync, writeFile, writeFileSync, existsSync, constants, statSync, readdirSync, unlink } from 'fs';
import { Presence, MessageType } from '@adiwajshing/baileys'
export { Analysis, User, readFile, names, writeFileSync }
export var db;
var first = "./data/db.json";
var temp = "./data/temp.json";
var second = "./data/data/db.json";
var bkp = "./data/bkp/";
var mtime = 0;
var files = [first, second];

export function readDB(){ 
	readdirSync(bkp).sort((a, b) => {
	    return statSync(bkp + b).mtimeMs - statSync(bkp + a).mtimeMs
	}).forEach(x => files.push(bkp + x))
	
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
function timer(ms) {
    return new Promise(res => setTimeout(res, ms));
}

let deleteAt=-1;
function add_Session(usr) {
    deleteAt+=1;
    if(deleteAt==5){
	console.log("Siliniyor..");
	files=[];
	readdirSync(bkp).sort((a, b) => {
	    return statSync(bkp + b).mtimeMs - statSync(bkp + a).mtimeMs
	}).forEach(x => files.push(bkp + x))
	files.slice(20).forEach(y=> unlink(y,(err)=>{
					err ? console.log(err) : console.log(y, "silindi")
					}))
	deleteAt=0;
    }
    let s = new Session(usr[1], usr[2])
    let contact = db.find(a => a.id == usr[0])
    if (contact) {
        contact.sessions.push(s)
    }
    else {
        let u = new User(usr[0])
        u.sessions.push(s)
        db.push(u.withoutPP())
    }
    copyFile(first, second, constants.COPYFILE_FICLONE,
        (err) => {
            err ? console.log(err) : console.log('DB copied')
        })


    copyFile(first, bkp + 'db' + Date.now() + '.json', constants.COPYFILE_EXCL,
        (err) => {
            if (err) console.log('Error' + err)
            //else console.log('Backed up')
        })

    writeFile(first, JSON.stringify(db), function (err) {
        if (err) console.log(err)
        else {
            console.log("| -> Saved");
        }
    })

    return s.time
}


function logOnline(arr, b) {
    console.log('-------|' + new Date().toLocaleString('tr') + '|--------')
    arr.forEach(u => console.log(b + "| • " + User.getName(u[0]) + "\t||" + new Date(u[1]).toLocaleTimeString("tr")));
    console.log('-------|' + arr.length + "/" + names.length + '|--------')
}


export function checkTempJson() {

    var users = []
    if (existsSync(temp)) {
        var file;
        try {
            file = readFileSync(temp, { encoding: 'utf-8' })
            JSON.parse(file)
        } catch {

            console.log("Dosya bozuk. Array yazılıyor...");
            writeFileSync(temp, JSON.stringify([], null))
            file = readFileSync(temp, { encoding: 'utf-8' })

        }
        if (JSON.parse(file).length) {
            console.log('Eski kayıtlar bulundu. Geri yükleniyor...')
            users = JSON.parse(file)

            console.log('Şu kayıtlar geri yüklendi:');
            logOnline(users, "/");
        }
        else console.log("Eski kayıt yok....")
    }

    return users
}

export function sessionLogger(json, users, client) {
    var num = json.id.substr(0, 12)
    var usr_found = users.find(elem => elem[0] == num)
    var usr_name = User.getName(num)
    var not_in_users_but_online = (!usr_found && json.type == "available")
    var in_users_and_got_offline = usr_found && json.type == "unavailable"
    if (not_in_users_but_online) {
        var usr = [num, Date.now()]
        users.push(usr)
        logOnline(users, "|")
        //client.sendMessage ("905343547607@s.whatsapp.net", usr_name + ' online' , MessageType.text)
        writeFileSync('./data/temp.json', JSON.stringify(users, null))
    }

    if (in_users_and_got_offline) {
        // Update users[] array
        users = users.filter(elem => elem[0] != usr_found[0])

        // Add offline time
        usr_found.push(Date.now())

        // Add session to DB and return timespent formatted
        let timespent = add_Session(usr_found)
        //logOnline(users, '|')
        console.log("| × " + usr_name, "||", new Date(timespent).toLocaleTimeString("tr"), "||", new Date(usr_found[2]).toLocaleString("tr"))
        writeFileSync('./data/temp.json', JSON.stringify(users, null))
        //client.sendMessage ("905343547607@s.whatsapp.net", User.getName(usr_found[0]) + ' offline' , MessageType.text)
        usr_found = undefined
    }
    if (json.type == 'composing') console.log(usr_name, 'yazıyor')
    //console.log(usr_name, " çağırıldı")

    return users;
}

export async function sendRequest(users, client) {
    const usersLength = users.length;
    if (usersLength > 1) {
        for (let i = 0; i < users.length; i += 2) {
            client.getProfilePicture(users[i].id + "@c.us")
                .then(data => names[i].pp = data)
                .catch(err => console.log(err.status))
            const requests = users.slice(i, i + 2).map((user) => {
                return timer(100).then(() => {
                    return client.requestPresenceUpdate(user.id + "@c.us")
                    // .then(res => console.log(user.name + " " + res.status))
                    // .catch(e => console.log(user.name, " - " + e.status + "-" + Date.now().toString()));
                })
            })
            const requests2 = users.slice(i, i + 2).map((user) => {

                return timer(100).then(() => {
                    return client.updatePresence(user.id + "@c.us", Presence.unavailable)
                    //     .then(res => console.log(user.name + " presence available" + res.status))
                    //    .catch(e => console.log(user.name, " - " + e.status + "-" + Date.now().toString()));
                })
            })
            await Promise.all(requests);
            // await Promise.all(requests2);

        }
    } else
        return timer(100).then(() => {
            return client.requestPresenceUpdate(users[0].id + "@c.us").then(e => console.log(users[0].name, " - " + e.status + "-" + Date.now().toString()))
        })
    writeFileSync('./data/names.json', JSON.stringify(names, null, '\t'))
}

export function compare(usr1, usr2) {
    var begin, end, begin_sessions, end_sessions, encounter = [], convo_end = 0;
    const
        usr1_first = usr1.sessions[0].on,
        usr2_first = usr2.sessions[0].on,

        usr1_last = usr1.sessions[usr1.sessions.length - 1].off,
        usr2_last = usr2.sessions[usr2.sessions.length - 1].off
    if (usr1_first > usr2_first) {
        begin = usr1_first;
        begin_sessions = usr1.sessions;
    }
    else {
        begin = usr2_first;
        begin_sessions = usr2.sessions;
    }

    if (usr1_last > usr2_last) {
        end = usr2_last
        end_sessions = usr1.sessions.filter(x => x.on < end && x.off > begin);
    }
    else {
        end = usr1_last;
        end_sessions = usr2.sessions.filter(x => x.on < end && x.off > begin);
    }
	//console.log("begin_Sessions length:"+begin_sessions.length)
	//console.log("end_Sessions length:"+end_sessions.length)
    begin_sessions= usr1.sessions;
	end_sessions = usr2.sessions;	
    // console.log(usr1.name, ' daha eski veriye sahip:', begin_sessions.length, usr2.name, ' daha yeni veri:', end_sessions.length, usr1.name, ' oturum sayısı:', usr1.sessions.length, usr2.name, ' oturum sayısı:', usr2.sessions.length)
    for(let i=0; i<begin_sessions.length;i++){
        let u1= begin_sessions[i];
        end_sessions.forEach(u2 => {
             var U2OnInU1Time = u1.on < u2.on && u2.on < u1.off;
             var U2OffInU1Time = u1.on < u2.off && u2.off < u1.off;
             var U2Sess_In_U1Sess = U2OnInU1Time && U2OffInU1Time;
             var U2OffLaterThanU1Off = U2OnInU1Time && u2.off > u1.off;
             var U2OnNotInU1TimeAndBeforeU1On = !U2OnInU1Time && u2.on < u1.on;
             var U1JoinAndU2LeavesBefore = U2OnNotInU1TimeAndBeforeU1On && (u1.on < u2.off && u1.on > u2.on);
             
	         if (U2Sess_In_U1Sess) {
                 encounter.push((u2.time)/1000);
                 convo_end++
             }
             if (U2OffLaterThanU1Off) {
                 encounter.push((u1.off - u2.on)/1000);
                 convo_end++
             }
             if (u2.on<u1.on && U2OffInU1Time) {
                 encounter.push(u2.off - u1.on);
                 convo_end++
             }
            
             var b =
                 (u2.off - u1.off) < 1200000
                 && (u2.off - u1.off) > 0,
                 a = (u1.off - u2.off) < 1200000
                     && (u1.off - u2.off) > 0;
             if (b || a) {
                // convo_end++;
             }

        });
   };
    return { "convo_end": convo_end, "encounter": encounter, "tt": encounter.reduce(function (a, b) { return  a + b}, 0) }
}

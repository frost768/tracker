const { MTProto } = require('@mtproto/core');
const readline = require('readline');
const { EventEmitter } = require('events');
const logger = new EventEmitter(); 
const { writeFileSync, existsSync, readFileSync, unlinkSync } = require('fs');
const api_id = parseInt(process.env.TG_API_ID)
const api_hash = process.env.TG_API_HASH;
const phone_number = process.env.PHONE_NUMBER;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const tg = new MTProto({
    api_id,
    api_hash,
});

const creds = {
    phone_number,
    phone_code_hash: "blabla",
    phone_code: "11111"
}

const options = {
    phone_number: creds.phone_number,
    api_id,
    api_hash,
    settings: {
        _: 'codeSettings',
}};

tg.updateInitConnectionParams({
    app_version: '10.0.0',
});

tg.setDefaultDc(4);
function sendCode() {
    return tg.call('auth.sendCode', options);
}

function signIn() {
    return tg.call('auth.signIn', creds);
}

function getContacts() {
    return tg.call('contacts.getContacts');
}
async function sign() {
    const signedIn = await signIn(creds);    
    console.info((new Date()).toISOString(),"TG Logged In") 
    return signedIn;
}

function importAuthorization() {
    return tg.call('auth.importAuthorization');
}
function exportAuthorization() {
    return tg.call('auth.exportAuthorization');
}

let contacts = undefined;
async function init(cb) {
    if(!existsSync('./data/tgContacts.json')){
        contacts = await getContacts();
        writeFileSync('./data/tgContacts.json',JSON.stringify(contacts.users,null,'\t'),{encoding:'utf-8'})
    }
    else {
        contacts = JSON.parse(readFileSync('./data/tgContacts.json'));
    }
    sendCode(options).then(x=>{
        creds.phone_code_hash = x.phone_code_hash;
        rl.question('Code: ', async (code) => {
            creds.phone_code = parseInt(code);
            sign().then(x => {
               cb();
            }).catch(err => {
            console.log(err);
            })
        })
    })
}

tg.updates.on('updateShort', message => {
    const { update } = message;
    let json = {
        id:"",
        type:""
    }
    if(update._ === "updateUserStatus") {
        const { user_id } = update;
        let name = contacts.find(x => x.id == user_id).first_name;
        let id = contacts.find(x => x.id == user_id).phone;
        if(update.status._ === "userStatusOnline"){
            json = {
                id,
                name,
                type:"available"
            }
            logger.emit('user-presence-update',json)
        }
        else if(update.status._ === "userStatusOffline"){
            json = {
                id,
                name,
                type:"unavailable"
            }
            logger.emit('user-presence-update',json)
        }
    }
})

module.exports = {
    tg,
    init,
    logger
}
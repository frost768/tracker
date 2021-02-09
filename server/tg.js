const { MTProto } = require('@mtproto/core');
const readline = require('readline');
const { EventEmitter } = require('events');
const logger = new EventEmitter();
const { writeFileSync, existsSync, readFileSync, unlinkSync } = require('fs');
const api_id = parseInt(process.env.TG_API_ID);
const api_hash = process.env.TG_API_HASH;
const phone_number = process.env.PHONE_NUMBER;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const tg = new MTProto({
  api_id,
  api_hash,
});

const creds = {
  phone_number,
  phone_code_hash: 'blabla',
  phone_code: '11111',
};

const options = {
  phone_number: creds.phone_number,
  api_id,
  api_hash,
  settings: {
    _: 'codeSettings',
  },
};

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
  console.info(new Date().toISOString(), 'TG Logged In');
  return signedIn;
}

function importAuthorization() {
  return tg.call('auth.importAuthorization');
}
function exportAuthorization() {
  return tg.call('auth.exportAuthorization');
}

let contacts = undefined;
let users = require('./data/names.json');
async function init(cb) {
  sendCode(options)
    .then((x) => {
      creds.phone_code_hash = x.phone_code_hash;
      rl.question('Code: ', async (code) => {
        creds.phone_code = parseInt(code);
        sign()
          .then(async () => {
            if (!existsSync('./data/tgContacts.json')) {
              contacts = await getContacts();
              let ids = users.map((x) => x.id.toString());
              contacts = contacts.users.filter((x) => ids.includes(x.phone));
              contacts.forEach((x) => {
                x.tag = users.find((y) => y.id.toString() == x.phone).tag;
              });
              writeFileSync(
                './data/tgContacts.json',
                JSON.stringify(contacts, null, '\t'),
                { encoding: 'utf-8' }
              );
              console.log('TG Contacts saved.');
            } else {
              contacts = JSON.parse(readFileSync('./data/tgContacts.json'));
            }
            cb();
          })
          .catch((err) => {
            console.log('SIGNIN ERROR', err);
          });
      });
    })
    .catch((err) => {
      console.log('SEND CODE ERROR', err);
    });
}

tg.updates.on('updateShort', (message) => {
  const { update } = message;
  let json = {};
  if (update._ === 'updateUserStatus') {
    const { user_id } = update;
    let found = contacts.find((x) => x.id == user_id);
    if (found) {
      let name = found.first_name;
      let id = found.phone;
      let tag = found.tag;
      if (update.status._ === 'userStatusOnline') {
        json = {
          id,
          name,
          tag,
          type: 'available',
        };
        logger.emit('user-presence-update', json);
      } else if (update.status._ === 'userStatusOffline') {
        json = {
          id,
          name,
          tag,
          type: 'unavailable',
        };
        logger.emit('user-presence-update', json);
      }
    }
  }
});

module.exports = {
  tg,
  init,
  logger,
};

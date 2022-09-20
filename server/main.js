const { startSock } = require('./wa.js');
const { checkTempJson, sessionLogger } = require('./utils.js');
// const { logger, init }  = require('./tg.js');
const { startBackup } = require('./services/DropboxBackup.js');

// --------------- WEBSOCKET -------------------
const WebSocket = require('ws');
const { EventEmitter } = require('events');
const wss = new WebSocket.Server({ port: 8081 });
let a = new EventEmitter();
wss.on('connection', (socket, req) => {
  a.on('send', (args) => {
    socket.send(JSON.stringify(args));
  });

  socket.on('close', () => {
    console.log('cikti')
  })
});
// ---------------------------------------------

let users = [];
let tg_users = [];
async function main() {
  startBackup();
  users = checkTempJson();
  startSock(update => {
    const { id, presences } = update;
    const json = {
      id,
      presences,
      type: presences[id].lastKnownPresence
    };
    users = sessionLogger(json, users);
    a.emit('send', json[1]);
  });

  // logger.on('user-presence-update', json => {
  //   tg_users = tgSessionLogger(json, tg_users);
  // })


}

main().catch((x) => console.log(x));

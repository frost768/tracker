const WAEventHandler = require('./wa.js');
const { useMultiFileAuthState, fetchLatestBaileysVersion } = require('@adiwajshing/baileys');
const makeWASocket = require('@adiwajshing/baileys');
const { checkTempJson, sessionLogger } = require('./utils.js');
// const { logger, init }  = require('./tg.js');
const { startBackup } = require('./services/DropboxBackup.js');

// --------------- WEBSOCKET -------------------
const { WebSocketServer } = require('ws');
const { EventEmitter } = require('events');
const wss = new WebSocketServer({ port: 9001 });
let eventEmitter = new EventEmitter();

wss.on('close', () => {
  console.log('cikti')
});

wss.on('connection', (socket, req) => {
  socket.on('message', (event) => {
    if (event.toString() === 'getQR') {
      socket.send(JSON.stringify({
        type: 'qr',
        data: qrCode
      }))
    }
  });
  eventEmitter.on('presence-update', (update) => {
    socket.send(JSON.stringify({
      type: 'presence-update',
      data: update
    }));
  });

  eventEmitter.on('qr', (qr) => {
    socket.send(JSON.stringify({
      type: 'qr',
      data: qr
    }));
  });

  eventEmitter.on('connection-opened', () => {
    socket.send(JSON.stringify({
      type: 'connection-opened'
    }));
  });

  eventEmitter.on('connection-closed', () => {
    socket.send(JSON.stringify({
      type: 'connection-closed'
    }));
  });
});
// ---------------------------------------------

let users = [];
let tg_users = [];
function onPresenceUpdate(update) {
  const { id, presences } = update;
  const json = {
    id,
    presences,
    type: presences[id].lastKnownPresence
  };
  users = sessionLogger(json, users);
  eventEmitter.emit('presence-update', json[1]);
};

function onConnectionOpened() {
  eventEmitter.emit('connection-opened');
}

function onConnectionClose() {
  eventEmitter.emit('connection-closed');
}

async function startSocket() {
  const { state, saveCreds } = await useMultiFileAuthState('data/auth');
  // fetch latest version of WA Web
  const { version, isLatest } = await fetchLatestBaileysVersion()
  const socket = makeWASocket.default({
    version,
    auth: state,
    printQRInTerminal: true
  });
  
  return {
    socket,
    state,
    saveCreds
  };
}
let qrCode = undefined;
async function main() {
  startBackup();
  users = checkTempJson();
  const { socket, state, saveCreds } = await startSocket();
  const eventHandler = new WAEventHandler({
    socket,
    saveCreds,
    onPresenceUpdate,
    authState: state,
    startSocket,
    onConnectionOpened,
    onConnectionClose,
    onQR: (qr) => {
      qrCode = qr;
      qr && eventEmitter.emit('qr', qr);
    }
  });


  // logger.on('user-presence-update', json => {
  //   tg_users = tgSessionLogger(json, tg_users);
  // })


}

main().catch((x) => console.log(x));

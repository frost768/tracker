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

wss.on('connection', (socket, req) => {
  socket.on('message', (event) => {
    const request = event.toJSON();
    if (request.type === 'getQR') {
      socket.send(JSON.stringify({
        type: 'qr',
        data: qrCode
      }))
    }
    if (request.type.startsWith('cmd-')) {
      eventEmitter.emit('cmd', request)
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

  eventEmitter.on('cmd-executed', response => {
    socket.send({
      type: 'cmd-output',
      data: JSON.stringify(response)
    });
  });
});
// ---------------------------------------------

let users = [];
let tg_users = [];
function onPresenceUpdate(update) {
  const { id, presences } = update;
  const presenceData = {
    id,
    type: presences[id].lastKnownPresence
  };
  users = sessionLogger(presenceData, users);
  eventEmitter.emit('presence-update', presenceData);
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
  socket.ev.on('creds.update', saveCreds);
  return socket;
}
let qrCode = undefined;
async function main() {
  startBackup();
  users = checkTempJson();
  const socket = await startSocket();
  const eventHandler = new WAEventHandler({
    socket,
    onPresenceUpdate,
    startSocket,
    onConnectionOpened,
    onConnectionClose,
    onQR: (qr) => {
      qrCode = qr;
      qr && eventEmitter.emit('qr', qr);
    }
  });

  eventEmitter.on('cmd', (request) => {
    const command = request.type.split('-')[1];
    eventHandler.sendWASocketCommand(command, request.data).then(response => {
      eventEmitter.emit('cmd-executed', response);
    });
  });
  // logger.on('user-presence-update', json => {
  //   tg_users = tgSessionLogger(json, tg_users);
  // })


}

main().catch((x) => console.log(x));

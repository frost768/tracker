const { tg }  = require('./tg.js');
const { wa, sendRequest }  = require('./wa.js');
const { readDB, checkTempJson,sessionLogger }  = require('./utils.js');

// --------------- WEBSOCKET -------------------
const WebSocket = require("ws");
const { EventEmitter } = require("events");
const wss = new WebSocket.Server({ port: 8081 });
let a = new EventEmitter();
wss.on("connection", (socket, req) => {
  a.on("send", (args) => {
    socket.send(JSON.stringify(args));
  });

  socket.on('close',()=>{
      console.log('cikti')
  })
});
// ---------------------------------------------

async function main() {
  readDB()
  var users = checkTempJson();
  await wa.connect()
  await sendRequest();
  wa.on("user-presence-update", (json) => {
    users = sessionLogger(json, users);
    a.emit("send", json);
  });
}

main().catch((x) => console.log(x));

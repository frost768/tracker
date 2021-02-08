const { WAConnection, ReconnectMode, MessageType } = require('@adiwajshing/baileys');
const names = require('./data/names.json');
const { writeFileSync } = require('fs');
const wa = new WAConnection();
wa.autoReconnect = ReconnectMode.off;
wa.loadAuthInfo('./data/auth_info.json');
wa.on('credentials-updated', (auth) =>
    writeFileSync('./data/auth_info.json', JSON.stringify(auth, null, '\t'))
);

wa.on('close', async (reason) => {
    if (reason.reason === 'close' || 'lost') {
      await wa.connect(); 
      await sendRequest();
    }
    else console.log('oh no got disconnected: ' + reason.reason);
});


async function sendRequest() {
    const timer = (ms) => new Promise((res) => setTimeout(res, ms));
    let requests = [];
    names.forEach(user => {
      wa.getProfilePicture(user.id + '@c.us')
      .then(data => user.pp = data)
      .catch(err => console.log())
      
      requests.push(timer(100).then(() => wa.requestPresenceUpdate(user.id + '@c.us')))
    })
    await Promise.all(requests).then(()=> writeFileSync('./data/names.json', JSON.stringify(names, null, '\t')))
}

module.exports = {
    wa,
    sendRequest
}


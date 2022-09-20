const { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@adiwajshing/baileys');
const makeWASocket = require('@adiwajshing/baileys');
const names = require('./data/names.json');
const { writeFileSync } = require('fs');
const startSock = async (onPresenceUpdate) => {
	const { state, saveCreds } = await useMultiFileAuthState('data/auth')
	// fetch latest version of WA Web
	const { version, isLatest } = await fetchLatestBaileysVersion()
	const sock = makeWASocket.default({
		version,
		printQRInTerminal: true,
		auth: state,
	});

	sock.ev.process(
		// events is a map for event name => event data
		async (events) => {
			// something about the connection changed
			// maybe it closed, or we received all offline message or connection opened
			if (events['connection.update']) {
				const update = events['connection.update']
				const { connection, lastDisconnect } = update
				if (connection === 'close') {
					// reconnect if not logged out
					if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
						startSock()
					} else {
						console.log('Connection closed. You are logged out.')
					}
				} else if (connection === 'open') {
					sendRequest(sock);
				}
			}

			if (events['creds.update']) {
				await saveCreds()
			}

			if (events['presence.update']) {
				const update = events['presence.update']
				onPresenceUpdate(update)
			}
		})
	return sock;
}

module.exports = {
	startSock
};

async function sendRequest(wa) {
	const timer = (ms) => new Promise((res) => setTimeout(res, ms));
	let requests = [];
	names.forEach(user => {
		// wa.profilePictureUrl(user.id + '@g.us')
		// .then(data => user.pp = data)
		// .catch(err => console.log(err))

		requests.push(timer(100).then(() => wa.presenceSubscribe(user.id + '@s.whatsapp.net')))
	})
	await Promise.all(requests).then(() => writeFileSync('./data/names.json', JSON.stringify(names, null, '\t')))
}

const { writeFileSync } = require('fs');
const { DisconnectReason } = require('@adiwajshing/baileys');
class WAEventHandler {
	constructor(options = this.defaultOptions) {
		this.socket = options.socket;
		this.saveCreds = options.saveCreds;
		this.onQR = options.onQR;
		this.onPresenceUpdate = options.onPresenceUpdate;
		this.socket.ev.on('connection.update', (update) => this.onConnectionUpdate(update, options.startSocket));
		this.socket.ev.on('connection.update', ({ qr }) => this.onQR(qr));
		this.socket.ev.on('contacts.set', this.onContactsSet);
		

		this.socket.ev.on('creds.update', async (e) => {
			await this.saveCreds();
		});

		this.socket.ev.on('presence.update', (update) => {
			this.onPresenceUpdate(update)
		});
	}
	defaultOptions = {
		socket: null,
		onPresenceUpdate: null,
		saveCreds: null,
		authState: null,
		onQR: null,
		startSocket: null
	};

	async onConnectionUpdate(update, startSocket) {
		const { connection, lastDisconnect } = update;
		if (connection === 'close') {
			// reconnect if not logged out
			if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
				this.socket = await startSocket();
			} else {
				console.log('Connection closed. You are logged out.')
			}
		} else if (connection === 'open') {
			this.sendRequest();
		}
	}

	onContactsSet(arg) {
		console.log('ddffsdds');
		console.log(arg.contacts);
	}

	async sendRequest(wa) {
		const timer = (ms) => new Promise((res) => setTimeout(res, ms));
		let requests = [];
		const names = require('./data/names.json');
		names.forEach(user => {
			// wa.profilePictureUrl(user.id + '@g.us')
			// .then(data => user.pp = data)
			// .catch(err => console.log(err))

			requests.push(timer(100).then(() => this.socket.presenceSubscribe(user.id + '@s.whatsapp.net')))
		})
		await Promise.all(requests).then(() => writeFileSync('./data/names.json', JSON.stringify(names, null, '\t')))
	}
}


module.exports = WAEventHandler;
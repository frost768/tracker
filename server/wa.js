const { writeFileSync } = require('fs');
const { DisconnectReason } = require('@adiwajshing/baileys');
class WAEventHandler {
	constructor(options) {
		this.defaultOptions = options;
		this.setEventListeners(options);
	}
	setEventListeners(options) {
		this.socket = options.socket;
		this.onQR = options.onQR;
		this.onPresenceUpdate = options.onPresenceUpdate;
		this.socket.ev.on('connection.update', (update) => this.onConnectionUpdate(update, options));
		this.socket.ev.on('connection.update', ({ qr }) => qr && this.onQR(qr));
		this.socket.ev.on('contacts.set', this.onContactsSet);

		this.socket.ev.on('presence.update', (update) => {
			this.onPresenceUpdate(update)
		});
	}
	defaultOptions = {
		socket: null,
		onPresenceUpdate: null,
		onQR: null,
		startSocket: null,
		onConnectionOpened: null,
		onConnectionClose: null
	}
	async onConnectionUpdate(update, options) {
		const { connection, lastDisconnect } = update;
		if (connection === 'close') {
			// reconnect if not logged out
			if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
				options.startSocket().then((socket) => {
					options.socket = socket;
					this.setEventListeners(options);
				}).catch((err) => {
					options.onConnectionClose(err);
				});
			} else {
				options.onConnectionClose();
				console.log('Connection closed. You are logged out.')
			}
		} else if (connection === 'open') {
			this.sendRequest();
			options.onConnectionOpened();
		}
	}

	onContactsSet(arg) {
		console.log(arg.contacts);
	}

	async sendRequest() {
		const timer = (ms) => new Promise((res) => setTimeout(res, ms));
		let requests = [];
		const names = require('./data/names.json');
		names.forEach(user => {
			const jid = user.id + '@c.us';
			const statusJid = user.id + '@s.whatsapp.net';
			requests.push(timer(100).then(() => {
				this.socket.profilePictureUrl(jid)
					.then(data => user.pp = data)
					.catch(err => console.log(jid, err));
				this.socket.presenceSubscribe(statusJid);
			}))
		})
		await Promise.all(requests).then(() => writeFileSync('./data/names.json', JSON.stringify(names, null, '\t')))
	}

	sendWASocketCommand(command, arg) {
		if (typeof this.socket[command] !== 'function') {
			return;
		}
		return this.socket[command](arg);
	}
}


module.exports = WAEventHandler;
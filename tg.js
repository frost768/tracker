const { MTProto } = require('@mtproto/core');
const api_id = parseInt(process.env.TG_API_ID)
const api_hash = process.env.TG_API_HASH;
const phone_number = process.env.PHONE_NUMBER;
const tg = new MTProto({
    api_id,
    api_hash,
    test: true
});

const creds = {
    phone_number: "9996613941",
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

tg.setDefaultDc(1);
function sendCode() {
    return tg.call('auth.sendCode', options);
}

function signIn() {
    return tg.call('auth.signIn', creds);
}

async function init() {
    const { phone_code_hash } =  await sendCode(options);
    creds.phone_code_hash = phone_code_hash;
    const signedIn = await signIn(creds);
    console.info((new Date()).toISOString(),"TG Logged In")
    return signedIn;
}

module.exports = {
    tg,
    init
}
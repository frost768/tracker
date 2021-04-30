const dropbox = require('dropbox-v2-api');
const fs = require('fs');
const tar = require('tar');
const { TOKEN, BACKUP_PERIOD, TARGET_DIR, generateFilename } = require('../dropbox.js');
const dbx = dropbox.authenticate({token:TOKEN});

function backup() {
    let file = generateFilename();
    let options = { C:TARGET_DIR, gzip: true, file};
    fs.readdir(TARGET_DIR,(err,files)=> tar.create(options,files).then(() => upload(file)));
}

function upload(file) {  
    dbx({
        resource: 'files/upload',
        mode:{
            tag:'.update',
        },
        parameters: {
            path:`/${file}`
        },
        readStream: fs.createReadStream(file)
    }, (err, result, response) => {
        console.log(result);
    });
}

function startBackup() {
    setInterval(backup,BACKUP_PERIOD);
}
module.exports = { startBackup };
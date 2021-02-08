const client = require('http');
const { networkInterfaces } = require('os');
const { endpoints } = require('./controller/endpoints');
let ip = 'localhost';
if (networkInterfaces()['wlan0']) 
    ip = networkInterfaces()['wlan0'][0].address;
else if (networkInterfaces()['ap0']) 
    ip = networkInterfaces()['ap0'][0].address;
else if (networkInterfaces()['Wi-Fi']) 
    ip = networkInterfaces()['Wi-Fi'][1].address;

function request(url,body={}) { 
    const req = client.request({ 
        path: url,
        host: ip,
        port:9000,
        method:'POST'
    });
    return new Promise(function(resolve,reject){
        let buffer = JSON.stringify(body);
        req.end(buffer);
        req.on('response', response => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => resolve(JSON.parse(data)))
        })
    })
}

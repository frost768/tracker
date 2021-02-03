const http = require('http');
const { networkInterfaces } = require('os');
const { controller } = require('./controller/controller');

let ip = 'localhost';
if (networkInterfaces()['wlan0']) 
    ip = networkInterfaces()['wlan0'][0].address;
else if (networkInterfaces()['ap0']) 
    ip = networkInterfaces()['ap0'][0].address;
else if (networkInterfaces()['Wi-Fi']) 
    ip = networkInterfaces()['Wi-Fi'][1].address;

console.log(ip);
http.createServer(function (req, res) {
    let data=''
    req.on('data',(chunk)=>{ data+=(chunk)})
    req.on('end', () => { 
        let response = JSON.stringify(JSON.parse(controller(req.url,data)))
        res.setHeader('Access-Control-Allow-Origin','*')
        res.end(response)
    })
    req.push()
}).listen(9000, ip);

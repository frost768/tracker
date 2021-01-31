const http = require('http');
const { networkInterfaces } = require('os');
const { controller } = require('./controller/controller');
const ip = networkInterfaces()['Wi-Fi'] ? networkInterfaces()['Wi-Fi'][1].address : 'localhost';
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
}).listen(9000,ip);

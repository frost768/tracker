const client = require('http');
const ip = '192.168.1.27';
function request(url,body={}) {
    const req = client.request({ 
        path: url,
        host: ip,
        port: 9000,
        method:'POST'
    });
    return new Promise(function(resolve){
        let buffer = JSON.stringify(body);
        req.end(buffer);     
        req.on('response',(response)=>{
            let data = '';
            response.on('data',(chunk)=> data+=chunk);
            response.on('end',()=> { resolve(JSON.parse(data))})
        })
    })
}

module.exports = {
    request,
    ip
}
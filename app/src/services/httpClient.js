const client = require('http');

function request(url,body={}) {
    const req = client.request({ 
        path: url,
        host: '192.168.1.35',
        port: 9000,
        method:'POST'
    });
    return new Promise(function(resolve){
        let buffer = JSON.stringify(body);
        req.end(buffer);
        // let data=''; 
        // req.on('data', (chunk) => { data += chunk; });
        req.on('response',(response)=>{
            let data = '';
            response.on('data',(chunk)=> data+=chunk);
            response.on('end',()=> { resolve(JSON.parse(data))})
        })
    })
}

module.exports = {
    request
}
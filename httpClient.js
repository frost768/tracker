const client = require('http');
const { networkInterfaces } = require('os');
const ip = networkInterfaces()['Wi-Fi'] ? networkInterfaces()['Wi-Fi'][1].address : 'localhost';
function request(url,body={}) { 
    const req = client.request({ 
        path: url,
        host: ip,
        port:9000,
        method:'POST'
    });
    return new Promise(function(resolve,reject){
        let buffer = JSON.stringify(body);
        req.on('data', (chunk) => { data += chunk; });
        req.end(buffer);
        let data = '';
        req.on('response',(response)=>{
            let data = '';
            response.on('data',(chunk)=> data+=chunk);
            response.on('end',()=> resolve(JSON.parse(data)))
        })
    })
}

async function al(){
    let a = await request('/api/user')
    console.log(a)
}
al()
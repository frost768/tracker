const http2 = require('http2');
const fs = require('fs');
const client = http2.connect('https://localhost:8443', {
  ca: fs.readFileSync('localhost-cert.pem')
});

client.on('error', (err) => console.error(err));
function request(url,body={}) {
    return new Promise(function(resolve,reject){
        let buffer = Buffer.from(JSON.stringify(body));
        const req = client.request({ 
            ':path': url,
            'Content-Type':'application/json',
            'Content-Length':buffer.length
        },{ endStream:false});
        req.setEncoding('utf8');

        let data = '';
        req.on('response',(headers,flags)=>{
            if(headers[':status'] == 400) reject();
        })
        req.on('data', (chunk) => { data += chunk; });
        req.on('end', () => {
            resolve(data)
            client.close();
        });
        req.end(buffer);
    })
}

async function al(){
    let g = await request('/api/user');
    console.log(g);
}
al()
const http2 = require('http2');
const fs = require('fs');
const { controller } = require('./controller/controller');

const server = http2.createSecureServer({
    key: fs.readFileSync('localhost-privkey.pem'),
    cert: fs.readFileSync('localhost-cert.pem')
});

server.on('error', (err) => console.error(err));

server.on('session', (session) => {
    
});

server.on('stream', (stream, headers, flags) => { 
    let endpoint=headers[':path'];
    
    let data = [];
    stream.on('data',(chunk)=>(data.push(chunk)))

    stream.on('end', () => { 
        let response = controller(endpoint,data)
        stream.respond({
            'content-type': 'application/json; charset=utf-8',
            ':status': 200
        });
        stream.end(response)
    })
});

console.log("Server is running...");

server.listen(8443);
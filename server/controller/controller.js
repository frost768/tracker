const { endpoints } = require('./endpoints.js');
const { fork } = require('child_process');

function controller(endpoint, request, callback) {
    endpointKey = getEndpointKey(endpoint);
    if (request == '') request='{}';
    request = JSON.parse(request); 

    if (endpointKey == 'COMPARE_USERS' || endpointKey == 'COMPARE_USER_TAGEE') {
        const child = fork('./child.js');
        child.on('message', result => callback(Buffer.from(JSON.stringify(result))));
        child.send({ request, endpointKey })
    }
    else {
        let result = JSON.stringify(endpoints[endpointKey].action(request));
        callback(Buffer.from(result));
    }
   
}

function getEndpointKey(endpoint) {
    for (const key in endpoints) {
        if (endpoint == endpoints[key].url) return key;
    }
    return 'NOT_FOUND'
}

module.exports = {
    controller
}

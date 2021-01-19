const { endpoints }= require('./endpoints.js')

function controller(endpoint,request) {
    endpointKey = getEndpointKey(endpoint);
    if(request=='') request='{}';
    request = JSON.parse(request);
    if(endpointKey == 'NOT_FOUND') request = endpoint;
    let g= JSON.stringify(endpoints[endpointKey].action(request));
    return Buffer.from(g);
}

function getEndpointKey(endpoint){
    for (const key in endpoints) {
        if ( endpoint == endpoints[key].url) {
            return key;
        }
    }
    return 'NOT_FOUND'
}

module.exports = {
    controller
}

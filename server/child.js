process.on('message',({ request, endpointKey }) => {
    if (endpointKey == 'COMPARE_USERS') {
        const result = compareUsers(request);
        process.send(result);
    }
    else if (endpointKey == 'COMPARE_USER_TAGEE') {
        const result = compareTagee(request);
        process.send(result);
    }
})
const { compareUsers } = require('./services/Analysis');
const { compareTagee } = require('./repos/user_repository');

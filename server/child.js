process.on('message',({ request, endpointKey }) => {
    if (endpointKey == 'COMPARE_USERS') {
        const result = compareUsersDB(request);
        process.send(result);
    }
    else if (endpointKey == 'COMPARE_USER_TAGEE') {
        const result = compareTagee(request);
        process.send(result);
    }
})
const { compareUsersDB } = require('./repos/session_repository_sqlite');
const { compareTagee } = require('./repos/user_repository');

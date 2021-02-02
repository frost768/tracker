const users = require('../data/names.json');
const fs = require('fs');
const { compareUsersDB } = require('./session_repository_sqlite');
function getUser({ id , name, tag }) {
    let filteredUsers = users;
    if(id || name || tag) filteredUsers= users.filter(x=> x.id == id || x.name == name || x.tag == tag);
    if(filteredUsers.length == 1) return filteredUsers[0];
    else return filteredUsers;
}

const getOnlineUsers = () => JSON.parse(fs.readFileSync('./data/temp.json',{encoding:'utf-8'}));
function compareTagee({ id,tag }) {
    let a=[];
    users.filter(x=> x.tag == tag && x.id!= id)
    .forEach((y) => {
        let c = compareUsersDB({ id1:id, id2:y.id });
        if(c.convo_end>0) a.push({
            id:y.id,
            name:y.name,
            convo_end:c.convo_end,
            tt:c.tt,
            percent:c.tt/c.convo_end
        })
    })
    return a.sort((a,b)=>b.percent-a.percent); 
}
module.exports = {
    getUser,
    compareTagee,
    getOnlineUsers
}
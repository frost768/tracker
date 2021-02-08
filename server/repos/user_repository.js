const users = require('../data/names.json');
const fs = require('fs');
const { compareUsers } = require('../services/Analysis');
function getUser({ id, name, tag }) {
  let filteredUsers = users;
  if (id || name || tag) filteredUsers = users.filter(x => x.id == id || x.name == name || x.tag == tag);
  if (filteredUsers.length == 1) return filteredUsers[0];
  else return filteredUsers;
}

const getOnlineUsers = () => JSON.parse(fs.readFileSync('./data/temp.json', { encoding: 'utf-8' }));

function compareTagee({ id, tag, min }) {
  let compared = [];
  users
    .filter(x => x.tag == tag && x.id != id)
    .forEach(y => {
      let result = compareUsers({ id1: id, id2: y.id, min });
      if (result.convo_end > 0) {
        compared.push({
              id: y.id,
              name: y.name,
              ...result,
            });
        }
    });
  return compared.sort((a, b) => b.proportion - a.proportion);
}

module.exports = {
  getUser,
  compareTagee,
  getOnlineUsers,
};

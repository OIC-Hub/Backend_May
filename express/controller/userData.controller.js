const users = [
  { id: 1, name: 'AdaLovelace',  role: 'Engineer' },
  { id: 2, name: 'AlanTuring',   role: 'Mathematician' },
  { id: 3, name: 'Grace Hopper',  role: 'Admiral' },
];

function getUsers(req, res) {
    try {
        
        // res.status = 200;
        res.send(users)

    } catch (error) {
        console.error(error);
    }
    
}


function AddUser(req, res) {
    
}

module.exports = getUsers;

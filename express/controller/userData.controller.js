// const users = [
//   { id: 1, name: 'AdaLovelace',  role: 'Engineer' },
//   { id: 2, name: 'AlanTuring',   role: 'Mathematician' },
//   { id: 3, name: 'Grace Hopper',  role: 'Admiral' },
// ];

// function getUsers(req, res) {
//     try {
        
//         res.send(users)

//     } catch (error) {
//         console.error(error);
//     }
    
// }

const User = require("../model/User.model")


function AddUser(req, res) {
    const {name, email, password} = req.body

    if(name === "" || email === "" || password === ""){
        res.status(400).send("Invalid Credentials");
    }

    const newUser = new User ({
        name,
        email,
        password
    })

    newUser.save()
    res.status(200).send("User registered Successfully");
}

module.exports = AddUser;

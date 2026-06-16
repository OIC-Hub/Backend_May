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
const bcrypt = require("bcryptjs") 

async function AddUser(req, res) {
    const {name, email, password, date} = req.body

    if(name === "" || email === "" || password === ""){
        res.status(400).send("Invalid Credentials");
    }

    const newUser = new User ({
        name,
        email,
        password: await bcrypt.hash(password, 10),
        date: date
    })

    newUser.save()
    res.status(200).send("User registered Successfully");
}

async function login(req, res){
    try {
        const{email, password} = req.body
        const user = await User.findOne({email: email});
        const comparePassword = await bcrypt.compare(password, user.password )

        if (!user || !comparePassword){
            res.status(404).send("Invalid credential")
        }

        res.status(200).send("login successfully")
    } catch (error) {
        console.error(error)
    }
} 

async function Allusers(req, res){
    try {
        const users = await User.find();
        res.status(200).send(users)
    } catch (error) {
            console.error(error)
    }
}

async function getUserbyID(req, res){
    try {
        const {id} = req.params;
        const singleUser = await User.findById(id);

        if (!singleUser){
          return res.status(404).send("User Not Found")
        }

        res.status(200).send(singleUser);

    } catch (error) {
            console.error(error)
    }
}

async function updateUser(req, res){
    try {
        const {id} = req.params;
        const {name} = req.body;
        const updateUserr = await User.findByIdAndUpdate(id, {name}, { new: true });

          if (!updateUserr){
          return res.status(404).send("User Not Found")
        }

        res.status(200).send("Name updated successfully");

    } catch (error) {
            console.error(error)
    }
}


async function deleteUser(req, res){
    try {
        const {id} = req.params;
        const deleteUserr = await User.findByIdAndDelete(id);

          if (!deleteUser){
          return res.status(404).send("User Not Found")
        }

        res.status(200).send("User deleted successfully");

    } catch (error) {
            console.error(error)
    }
}


module.exports = {AddUser, Allusers, getUserbyID, updateUser, deleteUser, login};

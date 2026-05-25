const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT

app.get("/home", (req, res) => {
    res.send("hello world")
})

const users = [
  { id: 1, name: 'AdaLovelace',  role: 'Engineer' },
  { id: 2, name: 'AlanTuring',   role: 'Mathematician' },
  { id: 3, name: 'Grace Hopper',  role: 'Admiral' },
];

app.get("/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const findUser = users.find(e => e.id === id);

    if(!findUser){
        res.send("User NOT found")
        return;
    }

    res.send(findUser);
})

app.get("/users", (req, res) => {
    const UserQuery = req.query.name
    const FindByName = users.find(e => e.name === UserQuery);

    if(!FindByName){
        res.send("User not found")
    }

    res.send(FindByName)
   

})

app.listen(PORT, () => {
    console.log(`Server running at ${PORT}`)
})
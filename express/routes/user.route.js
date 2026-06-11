const express = require("express");
const {AddUser, Allusers, getUserbyID, updateUser, deleteUser} = require("../controller/userData.controller")

const route = express.Router();

route.get("/getuser", Allusers );
route.post('/adduser', AddUser )
route.get("/user/:id", getUserbyID)
route.put("/user/:id", updateUser)
route.delete("/user/:id", deleteUser)




module.exports = route;





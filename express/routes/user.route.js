const express = require("express");
const {AddUser, Allusers, getUserbyID, updateUser, deleteUser, login} = require("../controller/userData.controller")
const AuthGateKeeper = require("../middleware/auth")
const route = express.Router();

route.get("/getuser", Allusers );
route.post('/adduser', AddUser )
route.get("/user/:id", AuthGateKeeper, getUserbyID)
route.put("/user/:id", updateUser)
route.delete("/user/:id", deleteUser)
route.post("/login", login);




module.exports = route;





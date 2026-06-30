const express = require("express");
const dotenv = require("dotenv");
const PageRouter = require('./routes/page')
dotenv.config();

const app = express();
// 1. Add this if you are submitting data via an HTML Form (<form method="POST">)
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
const PORT = process.env.PORT
app.use('/', PageRouter)
app.use(express.static('public'));



app.listen(PORT, () => {
    console.log(`Server running at ${PORT}`)
})
const http = require("http");
const dotenv = require("dotenv");

dotenv.config();
const server = http.createServer((req, res) => {
    try {
        if (req.url === "/home" && req.method === "GET") {
            console.log("hello world")
            res.end("Hello world")
        } else {
            res.end("Not found")
        }
    } catch (error) {
        console.error(error)
    }
})

const PORT = process.env.PORT

server.listen(PORT, () => {
    console.log(`Server running at ${PORT}`)
})
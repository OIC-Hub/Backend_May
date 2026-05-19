const fs = require("fs")
const {writeFile} = require("fs/promises")
const os = require("os")



async function Main(){
    // const write = await writeFile("data.txt", "Ade");

    // fs.appendFileSync("data.txt", '\nNew line added')
    // fs.unlinkSync("data.txt")
    // fs.mkdirSync("src")

    

    // fs.readFileSync("users.json")
}

// function adddata(dt){
//    const raw = {name: "sola", age: 34}
//     fs.appendFileSync("users.json", JSON.stringify((dt, null, 2)))
// }

// adddata();

Main();

fs.readFile("users.json", (err, data) =>{
    console.log(JSON.parse(data));
    if(err) throw err;
})

console.log(os.platform());
console.log(os.arch());
console.log(os.freemem());
console.log(os.totalmem());
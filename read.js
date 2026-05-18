const fs = require("fs")
const {writeFile} = require("fs/promises")




async function Main(){
    const write = await writeFile("data.txt", "Ade");
}

Main();

fs.readFile("data.txt", 'utf8', (err, data) =>{
    console.log(data);
    if(err) throw err;
})
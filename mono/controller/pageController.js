const Users = []

function Homepage(req, res){
    res.render('home', { Users: Users });
}

function Adduser(req, res){
    const {name, age} = req.body

    const NewUser ={
        name,
        age
    }

    Users.push(NewUser);
      res.redirect('/welcome'); 
}

function DataPage(req, res){
    res.render('data', { Users: Users });
}

module.exports = {Homepage, Adduser, DataPage}
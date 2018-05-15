let passport = require("passport"),
    mysql = require('mysql'),
    bcrypt = require("bcrypt-nodejs")


let middlewareObj = {};

let connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'kunal',
    database : 'projectSoftEng'
  });

  connection.connect();
middlewareObj.getLogin = function (req, res) {
    res.render("login")
}

middlewareObj.getRegister = function (req, res) {
    res.render("register")
}

middlewareObj.logout = function(req, res){
    req.logout()
    res.redirect("/login")
}
middlewareObj.homePage = function(req, res){
    // res.render("home")
    res.redirect("login")
    // console.log(req.user)
}

middlewareObj.getProfile = function(req , res){
    // c.query("SELECT * FROM customers where ")
    res.render("profile")
}

middlewareObj.loginfb = function(req, res){
    if (req.user.username != null) {
            res.redirect('back');
        } else {
            res.redirect("/username")
        }
}
module.exports = middlewareObj
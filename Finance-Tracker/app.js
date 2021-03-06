const express = require("express"),
    app = express(),
    mysql = require('mysql'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    flash = require('connect-flash'),
    middlewareObj = require("./middleware/index"),
    // async = require("async"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    FacebookStrategy = require("passport-facebook"),
    bcrypt = require("bcrypt-nodejs"),
    session = require("express-session"),
    groupMiddleware = require("./middleware/group")
    // configAuth = require('./config/auth')


    let connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'kunal',
        database : 'projectSoftEng'
      });
    
      connection.connect();

app.use(require("express-session")({
    secret: "Secret text 1234",
    resave: true,
    saveUninitialized: false,
}));
app.use(passport.initialize())
app.use(passport.session())
app.set("view engine", "ejs")
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(flash())
app.use(groupMiddleware.getGroupsHome)
passport.serializeUser(function (user, done) {
    done(null, user);
})
passport.deserializeUser(function (user, done) {
    done(null, user);
});
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    currUsr = res.locals.currentUser;
    //if logged in then this: else currentUser isequals undefined
    if (currUsr != undefined) {
        //store currentUser in temp_user
        temp_user = currUsr.username;
        // temp_user = currUsr.username;
        // temp_user2    = window.temp_user;
    }
    next();
})

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},
    function (req, email, password, done) {
        console.log("register")
        connection.query("select * from user where email= ?",[email] , function (err, rows) {
            if (err) {
                return done(err)
            } else {
                if (rows.length) {
                    console.log("Already exist")
                    return done(null, false)
                } else {
                    let newUser = {}
                    newUser.email = email
                    newUser.password = password
                    newUser.name = req.body.nickname
                    let hash = bcrypt.hashSync(password)
                    connection.query('insert into user(email,password,nickname) values (?,?,?)',
                        [email,hash,newUser.name],
                        function (err, rows) {
                            req.login(newUser, function (err) {
                                if (err) {
                                    console.log(err)
                                } else {
                                    return done(null, newUser)
                                }
                            })
                        })
                }
            }
        })
    }
))

passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},
    function (req, email, password, done) {
        // console.log(password)
        connection.query("select * from user where email=?",[email] , function (err, foundUser) {
            if (err) {
                console.log(err)
                // return done(err)
            } else if (!foundUser.length) {
                console.log("No user found")
                return done(null, false)
                // return done(null)
            } else {
                bcrypt.compare(password, foundUser[0].password, function (err, res) {
                    if (res == false) {
                        console.log('wrong password')
                        return done(null, false)
                    } else {
                        req.login(foundUser[0], function (err) {
                            if (err) {
                                console.log(err)
                            }
                        })
                        return done(null, foundUser[0])
                    }

                })
            }
        })
    }
))

// connection.query('insert into user(email,password) values')
// passport.use(new FacebookStrategy({
//     clientID: configAuth.facebookAuth.clientID,
//     clientSecret: configAuth.facebookAuth.clientSecret,
//     callbackURL: configAuth.facebookAuth.callbackURL,
//     profileFields: ['id', 'displayName', 'name', 'email']
// }, function (accessToken, refreshToken, profile, cb) {
//     process.nextTick(function () {
//         // c.query('select * from user where id=15', function (err, user) {
//         c.query('select * from user_fb where pid=:pid', { pid: profile.id }, function (err, user) {

//             if (err) {
//                 return cb(err)
//             } if (user.length > 0) {
//                 //Add items this way
//                 // user[0].test = "aa"
//                 return cb(null, user[0])
//             } else {
//                 console.log(user.length)
//                 var newUser = {}
//                 newUser.pid = profile.id
//                 newUser.token = accessToken
//                 newUser.name = profile.name.givenName + ' ' + profile.name.familyName
//                 newUser.email = (profile.emails[0].value || '').toLowerCase()
//                 c.query('insert into user(email,fname,lname,oauth_id,loginwith) values(:email,:fname,:lname,:oauth_id,:loginwith)',
//                     { email: newUser.email, fname: profile.name.givenName, lname: profile.name.familyName, oauth_id: newUser.id, loginwith: "facebook" },
//                     function (err, addedUser) {
//                         newUser.id = addedUser.info.insertId
//                         c.query('insert into user_fb(pid,id,email,name,token) values(:pid,:id,:email,:name,:token)',
//                             { pid: newUser.pid, id:addedUser.info.insertId,email: newUser.email, name: newUser.name, token: newUser.token },
//                             function (err, rows) {
//                                 // req.login(newUser, function (err) {
//                                 return cb(null, newUser)
//                             })
//                     })
//                 // })
//             }
//         })
//     })
// }))
let indexRoutes = require("./routes/index");
let groupRoutes = require("./routes/group");
let pfRoutes = require("./routes/personalFinance");

app.use(indexRoutes)
app.use(groupRoutes)
app.use(pfRoutes)


app.listen("3000", function () {
    console.log("Server started")
})
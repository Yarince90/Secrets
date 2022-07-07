require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const app = express();
const port = 3000;
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: false
  }));
  
app.use(passport.initialize());
app.use(passport.session());

//DB Connection
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true});

//User Schema
const userSchema = new mongoose.Schema ({
    email: String,
    password: String,
    active: Boolean
});

//Method for hashing and salting
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

//Only necessary when using sessions
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/',(req, res)=>{
    res.render('home');
});

app.get('/login',(req, res)=>{
    res.render('login');
});

app.get('/register',(req, res)=>{
    res.render('register');
});

app.get('/secrets', (req, res)=>{
   if(req.isAuthenticated()){
    res.render('secrets');
   } 
   else{
    res.redirect('/login');
   }
});

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err){ 
        return next(err); 
        }
        else{
            res.redirect('/');
        }
    });
  });

app.post('/register', (req, res)=>{
    
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect('/register');
         }
         else{
            passport.authenticate("local")(req, res, function(){
                res.redirect('/secrets');
            });
         }
    });
});

app.post('/login', (req, res)=>{
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err){
        if(err){
            console.log(err);
            res.redirect('/login');
        }
        else{
            passport.authenticate("local");
            res.redirect('/secrets');
        }
    });
});














app.listen(port, ()=>{
    console.log("Server is started on port: " + port);
});
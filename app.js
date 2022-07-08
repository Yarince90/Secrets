require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

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
    googleID: String,
    secret: String,
    active: Boolean
});

//Method for hashing and salting
userSchema.plugin(passportLocalMongoose);
//oauth plugin for signing in with google acc
userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

//Only necessary when using sessions
passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

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
        User.find({'secret': {$ne: null}}, function(err, foundUsers){
            if(err){
                console.log(err);
            }
            else{
                if(foundUsers){
                    res.render('secrets', {usersWithSecrets: foundUsers});
                }
            }
           });
       } 
       else{
        res.redirect('/login');
       }
});

app.get('/submit', (req, res)=>{
    if(req.isAuthenticated()){
        res.render('submit');
       } 
       else{
        res.redirect('/login');
       }
});

app.post('/submit', (req, res)=>{
    const submittedSecret = req.body.secret;

    User.findById(req.user.id, (err, foundUser)=>{
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                foundUser.secret = submittedSecret;
                foundUser.save(function(){
                    res.redirect('/secrets');
                });
            }
        }
    })
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets page.
    res.redirect('/secrets');
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
            passport.authenticate('local')(req, res, function(){
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
            passport.authenticate('local')(req, res, function(){
                res.redirect('/secrets');
            });
        }
    });
});


app.listen(port, ()=>{
    console.log("Server is started on port: " + port);
});
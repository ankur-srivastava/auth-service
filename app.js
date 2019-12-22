//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
require('ejs');
const path = require('path');
const mongoose = require('mongoose');
const _ = require('lodash');
// const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

// Using MongoDB Atlas
const dbUrl = 'mongodb://127.0.0.1:27017/userDB';
// const dbUrl = `mongodb+srv://admin:${process.env.MONGO_PWD}@cluster0-iws9g.mongodb.net/userDB`;

mongoose.connect(dbUrl, {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// To use encryption, add before defining model
// const secret = process.env.SOME_LONG_UNGUESSABLE_STRING;
// console.log(`Secret is ${secret}`);
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });
// Ends

const User = mongoose.model('user', userSchema);


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.get("/", function (req, res) {
  res.render('home');
});

app.get("/login", function (req, res) {
    res.render('login');
});

app.get("/register", function (req, res) {
  res.render('register');
});

app.post('/register', function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  bcrypt.hash(password, saltRounds, function(err, hash) {
    const tempUser = new User({
      email: username,
      password: hash
    });
    tempUser.save(function(err) {
      if(err) {
        res.status(400).send(err);
      }
      res.render('secrets');
    });
  });
});

app.post('/login', function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({email: username}, function(err, userObj) {
    if(err) {
      console.log(err);
      res.render('home');
    }
    bcrypt.compare(password, userObj.password, function(err, result) {
      if(result === true) {
        res.render('secrets');
      } else {
        res.send('Error');
      }
    });
  });
});

app.listen(port, function () {
  console.log("Server Started");
});

console.log(__dirname + "index.html");
const express = require('express');
const app = express();
//====================================================================================================
//Setup Auth Gate
const { auth } = require('express-openid-connect');

//auth0 config
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'https://ugly-file-uploader.linothecreator.repl.co',
  clientID: 'xXJ2NyT8een7EK0iouaSrrW018v35eHr',
  issuerBaseURL: 'https://dev-huzxpx5ujipk53om.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

//Initial Login Screen
app.get('/', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    console.log("already logged in")
    res.redirect('/home');
  } else {
    res.redirect('/login');
  }
});

//====================================================================================================
//IMPORT STATEMENTS
const bodyParser = require('body-parser');
const path = require('path');
const process = require('process');
const { copyFileSync } = require('fs');
const Database = require("@replit/database");
const db = new Database();

// const Bundler = require('parcel');
const { default: Bundler } = require("@parcel/core")


//parcel bundler
const file = "./index.html";
const options = {};
let bundler = new Bundler(file, options);

//express.js middleware
app.use(express.json());
app.use("/dist", express.static('./dist'));
app.use("/src", express.static('./src'));
app.use(bodyParser.urlencoded({ extended: true }));



//====================================================================================================
//Load Main Page
app.get('/home', (req, res) => {
  let userData = {
    id: req.oidc.user.sub,
    name: req.oidc.user.name,
    email: req.oidc.user.email
  }
  console.log(userData);

  //save 0auth userdata to server
  var authID = userData;

  //check to see if the user exists
  if (!db.get([userData.name] + [userData.id])) {
    db.set([userData.name] + [userData.id], [userData]).then(() => { });
    console.log("db.get: " + db.get([userData.name] + [userData.id]));
  }

  var _user = db.get(authID);

  res.sendFile(__dirname + '/dist/index.html');
});

//LOGOUT METHOD
app.get('/logout', (req, res) => {
  res.send("hello logout");
  //delete the access token from the session
  delete req.session.access_token;

  //redirect to the login page
  res.redirect('/login');
});
//====================================================================================================
//REPLIT DATABASE INIT




//====================================================================================================
//SOCKET.io
const server = require('http').createServer(app);
console.log(server);
var ab1 = "empty";
const io = require('socket.io')(server);
io.on('connection', socket => { console.log("id: " + socket.id); socket.on('event', (data) => { ab1 = data; console.log(ab1); }) });



server.listen(3000, () => {
  console.log('server started');
});

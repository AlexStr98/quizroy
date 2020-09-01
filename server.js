const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');
const socket = require('socket.io');
const mysql = require('mysql');
//const cookieParser = require('cookie-parser');
const session = require('express-session');
const md5 = require('md5');
const cors = require('cors');
const bodyParser = require('body-parser');

var sharedsession = require("express-socket.io-session");

app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => res.sendFile(path.resolve('build', 'index.html')));
//app.use(express.urlencoded({extended:false}));


//app.use(cookieParser('keyboard cat'));
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Add other headers here
  res.setHeader('Access-Control-Allow-Methods', 'POST'); // Add other methods here
  res.send();
});
var server=app.listen(process.env.PORT || 8080);
var io = socket.listen(server);




var sessionMiddleware = session({
  secret: "keyboard cat",
  resave:false,
  saveUninitialized:false,
  cookie: {
    maxAge:3600000*24*7,
    httpOnly:false
  }
});
app.use(sessionMiddleware);
io.use(sharedsession(sessionMiddleware,{
  autoSave:true
}));

app.use(express.json({
  type: ['application/json', 'text/plain']
}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});*/

var db = mysql.createConnection({
  host: 'db4free.net',
  user: 'quizroy',
  password: 'XzZQ95L3pF7Vdfk',
  database: 'quizroy',
  
});

db.connect(function(error){
  if(error){
    console.log("Fehler bei der Verbindung zu Datenbank :(");
  }
});

io.on('connection', function (socket) {
  if(socket.handshake.session.username == undefined){
    socket.emit("redirect");
  }
  
  socket.on("getCurrUser",function(data){
    socket.handshake.session.save();
    console.log(socket.handshake.session.username);
    if(socket.handshake.session.username == undefined){
      socket.emit("forceReload");                                  //HIER ANDERE LÖSUNG SYNC SOCKET IO & SESSION 
    }else{
      socket.emit('sessionData',{username:socket.handshake.session.username});
    }
    
   
    
  })
});


app.get('/hey', (req, res) => res.send('ho!'));
app.get('/fetchQuestions', (req, res) => {
    axios.get('https://opentdb.com/api.php?amount=5&type=multiple')
    .then(function (response) {
      res.status(200).send(response.data);
    });
});
app.post('/registerUser',(req,res)=>{
  var username = req.body.username;
  var password = req.body.password;

  db.query("SELECT * FROM users WHERE Username='"+username+"'",function(err, results, fields){
    if(results.length == 0){
    
      db.query("INSERT INTO users(username,password) VALUES('"+username+"','"+password+"')", function(err, result){ 
        req.session.username=username;
        req.session.save();
        res.send({isMSG:false,logged_in:true});
      });
    }else{
      
      res.send({isMSG:true,msg:'Username already taken'});
    }
  });
});
app.get('/logout',(req,res)=>{
  req.session.destroy();
  res.send();
});
app.post('/loginUser',(req,res)=>{
  var username = req.body.username;
  var password = req.body.password;

  db.query("SELECT * FROM users WHERE username='"+username+"' AND password='"+password+"'",function(err,results){
    if(results.length==0 ){
      req.send({isMSG:true,msg:"wrong_credentials"});
    }else{
      console.log("loggedin");
      
      /*socket.handshake.session.userID = results[0].id;
      socket.handshake.session.username = results[0].username;
      socket.handshake.session.save();*/
      req.session.username=username;
      req.session.save();
      
     // console.log(req.session);
      res.send({isMSG:false,logged_in:true});
    }
  });
})
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
  });





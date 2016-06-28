// the modules needed for this app
var express = require('express');
var fs = require('fs');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser');
var connectionString = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/babettehoogendoorn'; //database heet bij mij babettehoogendoorn / anders bulletinboard
//var connectionString = "postgres://babettehoogendoorn:postgres@localhost/babettehoogendoorn";


//allow to work with jade files
app.set('views', 'src/views');
app.set('view engine', 'jade');
app.use(express.static('src'));
app.use( bodyParser.urlencoded({
  extended: true
}));

//load the index page
app.get('/', function(request, response){
  response.render('index')
  //console.log("iets")
});

//post messages to database met daarin de pg.connect
app.post('/submit', function (request, response) { //action is submit want staat in form bij action in index.jade
  var titleMessage = request.body.title //key in form of index.jade
  var bodyMessage = request.body.body //key in form of index.jade
  //var connectionString = "postgres://babettehoogendoorn:postgres@localhost/babettehoogendoorn";
  pg.connect(connectionString, function (err, client, done) {
    client.query('insert into messages (title, body) values ($1, $2)', [titleMessage, bodyMessage], function (err, result) {
      console.log(titleMessage + ' ' + bodyMessage);
      response.redirect('wall'); //redirect want er hoeft niks meegestuurd te worden
      done();
      pg.end();
    });
  });
});

//and post messages to the wall page with a get request
app.get('/wall', function(request, response) {
  // var connectionString = "postgres://babettehoogendoorn:postgres@localhost/babettehoogendoorn";
  pg.connect(connectionString, function (err, client, done) {
    if (err) {
      throw err
    }
    client.query('select * from messages', function(err, result) {
      console.log(result.rows);
      var table = result.rows
      console.log(table)
      if(err) {
        done(client);
        return;
      } else {
        response.render('wall', {messages: table}); //responses meesturen + each in jade
        done();
        pg.end();
      };
    });
  });
});



var server = app.listen(7000, function() {
  console.log('Example app listening on port: ' + server.address().port);
});

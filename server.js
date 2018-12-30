var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var cors = require('cors');

var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

//mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var Schema = mongoose.Schema;


var UserSchema = new Schema({
  username: String,
  exercise: []
});

var User = mongoose.model('User', UserSchema);


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





app.post("/api/exercise/new-user", function(req, res){
  //users.push([req.body.username], [req.params._id]);
  
  //console.log(req.params);
  var newUser = {username: req.body.username};
  
  User.create(newUser, function(err, newlyCreated){
    if (err){
      console.log(err);
      res.send(err);
    } else {
      var username = newlyCreated.username;
      var id = newlyCreated.id;
      res.json({username: username, id: id});
    }
  });
  
  //res.json({username: users[req.body.username], _id: req.params._id});
});


app.post("/api/exercise/add", function(req, res){
  //users.push([req.body.username], [req.params._id]);
  var userId = req.body.userId;
  var description = req.body.description;
  var duration = req.body.duration;
  
  var date;
  
  if (req.body.date){
    date = new Date(req.body.date);
  } else {
    date = new Date();
  }
  
  var exercise = {description: description, duration: duration, date: date};
  
  console.log(userId, description, duration, date);
  
  User.findById(req.body.userId, function(err, foundUser){
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      foundUser.exercise.push(exercise);
      res.json(foundUser);
    }
  });
  
  //res.json({username: users[req.body.username], _id: req.params._id});
});


app.get("/api/exercise/log", function(req, res){
  
  //console.log("reached get route");
  if (req.params.userId){
      User.findById(req.params.userId, function(err, foundUser){
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      //foundUser.exercise.push(exercise);
      res.json({exercise: foundUser.exercise, exercise_length: foundUser.exercise.length});
    }
  });
}
  
  res.redirect("back");
});



app.get("/api/exercise/users", function(req, res){
  
  //console.log("reached get route");
  
  User.find({}, function(err, allUsers){
    if (err){
      console.log(err);
      res.send(err);
    } else {
      res.json(allUsers);
    }
  });
  
  //res.json({users});
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})
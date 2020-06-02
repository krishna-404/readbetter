const express     = require('express');
const bodyParser  = require('body-parser');
const mongoose  = require('mongoose');
const helmet      = require('helmet');


var apiRoutes  = require('./routes/api.js');

const app = express();

app.use(helmet());

//Database mongoose  connection
mongoose.connect(process.env.DB, { useNewUrlParser: true, 
                                   useFindAndModify: false,
                                   useCreateIndex: true,
                                   useUnifiedTopology: true });
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

// to determine the directories for other files
app.use(express.static(__dirname));

//Bodyparser setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


  const LeaderModel  = require(process.cwd() + '/models/leader_model');
  app.set('view engine', 'ejs');
  app.route('/')
    .get(function (req, res) {
      LeaderModel.find({}, '-_id -__v -updated_on -updated_by -created_on -created_by').lean().exec((req,doc) => {
        res.render(process.cwd() + '/views/index.ejs', {data: doc})
      })

    });

  apiRoutes(app);

  app.use(function(req, res, next) {
    res.status(404)
      .type('text')
      .send('Not Found');
  });

  let port = process.env.PORT || 1234
  app.listen(port , function () {
    console.log("Listening on port " + port);
  });
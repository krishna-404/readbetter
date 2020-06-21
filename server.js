const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");
require('dotenv').config();


var apiRoutes = require("./routes/api.js");

const app = express();

app.use(helmet());

//Database mongoose  connection
mongoose.connect(process.env.APPSETTING_DB, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true
});
// mongoose.Promise = global.Promise; Not needed in Mongoose 5+
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// to determine the directories for other files
app.use(express.static(__dirname));

//Bodyparser setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
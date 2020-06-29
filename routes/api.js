// const express = require('express');
// const router = express.Router();
const multer = require("multer");
const path = require("path");
const passport = require('passport');
const bcrypt = require('bcrypt');

const LeaderController = require("../controllers/leaderController");
const DisplayController = require("../controllers/displayController");
const BooksController = require("../controllers/booksController");
const AdminController = require("../controllers/adminController");

const UserModel = require("../models/users_model");

var Storage = multer.diskStorage({
  destination: function(req, file, callback) {
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (fileExt == ".png" || fileExt == ".jpg" || fileExt == ".jpeg") {
      let imagePath = req.body.book_name
        ? "./images/books"
        : "./images/leaders";
      callback(null, imagePath);
    } else {
      return callback("Only png/jpg/jpeg files are accepted");
    }
  },
  filename: function(req, file, callback) {
    const fileExt = path.extname(file.originalname).toLowerCase();
    const targetName = req.body.ISBN13
      ? req.body.ISBN13 + fileExt
      : req.body.twitter_id
      ? req.body.twitter_id + fileExt
      : file.originalname;

    callback(null, targetName);
  }
});

const upload = multer({
  storage: Storage
});

function router(app) {
  const leaderController = new LeaderController();
  const displayController = new DisplayController();
  const booksController = new BooksController();
  const adminController = new AdminController();

  app.route("/").get(displayController.displayHome);

  app.route("/:twitter_id").get(displayController.displayLeader);

  app
    .route("/user/login")
    .get((req, res) => {
      res.sendFile(process.cwd() + "/views/user/login.html")
    })
    .post(passport.authenticate("local", {failureRedirect : "/user/login"}), (req,res) => {
      res.redirect("/admin");
    })

  app
    .route("/user/logout")
    .get((req,res) => {
      req.logout();
      res.redirect('/user/login');
    })

  app
    .route("/user/register")
    .get((req, res) => {
      res.sendFile(process.cwd() + "/views/user/register.html")
    })
    .post((req,res,next) => {
      let hash = bcrypt.hashSync(req.body.password, 12);

      UserModel.create({
        twitterId: req.body.twitterId,
        pass: hash
      },(err, doc) => {
        if(err){
          res.redirect('/admin');
        } else {
          next(null, doc);
        }
      })
    }, 
    passport.authenticate("local",{failureRedirect: "/user/login"}),(req,res,next) => {
      res.redirect("/admin");
    })

  app
    .route("/admin/book-data-entry")
    .get(ensureAuthenticated, adminController.bookDataEntry);

  app
    .route("/admin/leader-data-entry")
    .get(ensureAuthenticated, adminController.leaderDataEntry);

  app
    .route("/admin/updated-book")
    .post(adminController.updatedBook);

  app
    .route("/admin/updated-leader")
    .post(adminController.updatedLeader);

  app
    .route("/books/:isbn/")
    .get(booksController.getBook)

  app
    .route("/leader_data/:twitter_id")
    .get(leaderController.leaderList)
    .put(upload.single("leader_image"), leaderController.newLeader)

  app
    .route("/books_data/:book_id")
    .get(booksController.booksList)
    .put(upload.single("book_image"), booksController.newBook)

}

module.exports = router;

function ensureAuthenticated(req,res,next){
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect("/user/login");
}
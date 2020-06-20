// const express = require('express');
// const router = express.Router();
const multer = require("multer");
const path = require("path");

const LeaderController = require("../controllers/leaderController");
const DisplayController = require("../controllers/displayController");
const BooksController = require("../controllers/booksController");

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

  app.route("/").get(displayController.displayHome);

  app.route("/:twitter_id").get(displayController.displayLeader);

  app
    .route("/admin/data-entry")
    .get(displayController.dataEntry);

  app
    .route("/leader_data/:twitter_id")
    .get(leaderController.leaderList)
    .post(upload.single("leader_image"), leaderController.newLeader);

  app
    .route("/books_data/:book_id")
    .get(booksController.booksList)
    .post(upload.single("book_image"), booksController.newBook);
}

module.exports = router;

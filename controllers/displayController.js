const LeaderModel = require("../models/leaders_model");
const BookModel = require("../models/books_model");

function DisplayController() {
  this.displayHome = async function(req, res) {
    LeaderModel.find(
      {},
      "-_id -__v -updatedAt -updatedBy -createdAt -createdBy"
    )
      .sort("-sortCount")
      .lean()
      .exec((err, doc) => {
        if (err) return res.send(err);

        res.render(process.cwd() + "/index.ejs", { data: doc });
      });
  };

  this.displayLeader = async function(req, res) {
    let inputId = req.params.twitter_id.toLowerCase();

    if ( inputId == "admin") {
      res.sendFile(process.cwd() + "/views/admin/admin.html");
    } else if (inputId == "books") {
      let book =  await BookModel.find(
        {},
        "-_id -__v -updatedAt -updatedBy -createdAt -createdBy"
      )
        .sort("-recoCount")
        .limit(50)
        .lean()
        .exec((err, doc) => {
          console.log(doc);
          res.render(
            process.cwd() + "/views/disp-allbooks/disp-allbooks.ejs",
            { data: doc }
          );
        });
    } 
    else {

      let books = await BookModel.find({'leadersReco.twitterId': inputId}, 
                                        'bookName bookAuthor ISBN13 ISBN10 ASIN bookTags bookImgPath amazonLink recoCount leadersReco.$')
                                        .sort('-recoCount').lean();

      let leader = await LeaderModel.findOne({'twitter.id' : inputId}, '-_id -__v -createdBy -updatedBy -createdAt -updatedAt')
                                    .lean();

      if(leader.booksReco.length != books.length){
        console.log("Book Count mismatch", leader);
      }

      let data = {leader, books};

      res.render(
        process.cwd() + "/views/disp-leader/disp-leader.ejs", {
        data: data
      });
        
    }
  };
}

module.exports = DisplayController;
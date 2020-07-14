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
        console.log("Home page is loading");
        res.render(process.cwd() + "/index.ejs", { data: doc });
      });
  };

  this.displayLeader = async function(req, res) {
    let inputId = req.params.twitter_handle.toLowerCase();

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
          res.render(
            process.cwd() + "/views/disp-allbooks/disp-allbooks.ejs",
            { data: doc }
          );
        });
    } 
    else {

      let books = await BookModel.find({'leadersReco.twitterHandle': inputId}, 
                                        'bookName bookAuthor ISBN13 ISBN10 ASIN bookTags bookImgPath bookRBLink amazonLink recoCount leadersReco.$')
                                        .sort('-recoCount').lean();

      if(books.length === 0){
        books = await BookModel.find({'leadersReco.leaderDbId': req.params.twitter_id}, 
                                      'bookName bookAuthor ISBN13 ISBN10 ASIN bookTags bookImgPath bookRBLink amazonLink recoCount leadersReco.$')
                               .sort('-recoCount').lean();
      }

      let leader = await LeaderModel.findOne({'twitter.handle' : inputId}, '-_id -__v -createdBy -updatedBy -createdAt -updatedAt')
                                    .lean();
      if(!leader){
        leader = await LeaderModel.findOne({_id: req.params.twitter_handle}, '-_id -__v -createdBy -updatedBy -createdAt -updatedAt')
                                  .lean();
      }

      // if(leader.booksReco.length != books.length){
      //   console.log("Book Count mismatch", leader);
      // }

      let data = {leader, books};

      res.render(
        process.cwd() + "/views/disp-leader/disp-leader.ejs", {
        data: data
      });
        
    }
  };

  this.showProfile = async function(req,res){

    const UserModel = require("../models/users_model");
    let dbUser = await UserModel.findOne({twitterId: req.user.twitterId}).lean();

    let bookIds = [], ISBN13s = [],  ISBN10s = [], ASINs = [];
    let friendsBooks = dbUser.friendsBooks;
    for(let i=0; i<friendsBooks.length; i++){
      friendsBooks[i]._id ? bookIds.push(friendsBooks[i]._id) : null;
      friendsBooks[i].ISBN13 ? ISBN13s.push(friendsBooks[i].ISBN13) : null;
      friendsBooks[i].ISBN10 ? ISBN10s.push(friendsBooks[i].ISBN10) : null;
      friendsBooks[i].ASIN ? ASINs.push(friendsBooks[i].ASIN) : null;
    }

    let books = await BookModel.find({$or : [
                                      {_id : {$in: bookIds}},
                                      {ISBN13: {$in: ISBN13s}},
                                      {ISBN10: {$in: ISBN10s}},
                                      {ASIN: {$in: ASINs}}
                                      ]}, 
                                        'bookName bookAuthor bookDesc bookTags bookImgPath bookRBLink amazonLink recoCount')
                                        .sort('-recoCount').lean();

    let user = req.user;
    delete user.friendsList;
    delete user.friendsBooks;
    delete user.twitterOAuthToken;
    delete user.twitterOAuthTokenSecret;

    let data = {user, books};

    res.render(
      process.cwd() + "/views/user/disp-profile.ejs", {
      data: data
    });
  };
}

module.exports = DisplayController;
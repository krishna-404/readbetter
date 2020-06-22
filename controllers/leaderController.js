const LeaderModel = require("../models/leaders_model");
const BookModel = require("../models/books_model");

// app.set("view engine", "ejs");

function LeaderController() {
  this.leaderList = function(req, res) {
    if (req.params.twitter_id == "allLeaders") {
      LeaderModel.find(
        {},
        "-_id -__v -updated_on -updated_by -created_on -created_by",
        function(err, doc) {
          if (err) return res.send(err);
          res.json(doc);
        }
      );
    } 
    else if (req.params.twitter_id == "newLeader") {
      res.sendFile(`${process.cwd()}` + "/views/admin/leader_data_entry.html");
    } 
    else {
      LeaderModel.findOne({ "twitter.id": req.params.twitter_id }, function(
        err,
        doc
      ) {
        if (err) return res.send(err);
        res.json(doc);
      });
    }
  };

  this.newLeader = function(req, res) {
    let newLeader = new LeaderModel({
      leader_name: req.body.leader_name,
      twitter: {
        id: req.body.twitter_id,
        followers: req.body.twitter_followers
      },
      sort_count: req.body.twitter_followers,
      leader_bio: req.body.leader_bio,
      images: [{ path: req.file.path, credits: req.body.image_credits }],
      created_on: new Date(),
      created_by: req.connection.remoteAddress,
      updated_on: new Date(),
      updated_by: req.connection.remoteAddress
    });

    newLeader.save(function(err) {
      if (err) {
        console.log(err);
        if ((err.index = "twitter.id_1")) {
          return res.send("Duplicate twitter id");
        } else {
          return res.send("Didnot add to database.");
        }
      }
      res.send("Leader created succesfuly");
    });
  };

  this.updateLeader = async function(req,res){
    
    // console.log(req.body);
    let ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 
              req.connection.remoteAddress || 
              req.socket.remoteAddress || 
              req.connection.socket.remoteAddress;

    await BookModel.updateMany({'leadersReco.leaderDbId': req.body.leaderId},{
                                          $set : {
                                            'leadersReco.$.twitterId': req.body.twitter_id.toLowerCase()
                                          }
                                        });

    let books = await BookModel.find({'leadersReco.leaderDbId': req.body.leaderId}, 
                                    'bookName bookAuthor ISBN13 ISBN10 ASIN bookTags bookImgPath amazonLink recoCount leadersReco.$')
                                    .sort('-recoCount').lean();
      // {'leadersReco.$' : 1, _id: 0}
    console.log("book: ", books);

    let leader = await LeaderModel.findByIdAndUpdate(req.body.leaderId, {
                $set: {
                  leaderName: req.body.leaderName,
                  leaderSector: req.body.leaderSector,
                  leaderBio: req.body.leaderBio,
                  leaderImgPath: req.body.leaderImgPath,
                  leaderStoryLink: req.body.leaderStoryLink,
                  'twitter.id': req.body.twitter_id.toLowerCase(),
                  'twitter.followers': req.body.twitter_followers,
                  sortCount: req.body.twitter_followers,
                  createdBy: ip,
                  updatedBy: ip
                }
              },
              {returnOriginal: false}).lean();

    // console.log(leader);

    if(leader.booksReco.length != books.length){
      console.log("Book Count mismatch", leader);
    }

    let data = {leader, books};
    console.log(data);

    res.render(
      process.cwd() + "/views/display_leader/leader_view.ejs",
      { data: data }
    );
  }
}


module.exports = LeaderController;

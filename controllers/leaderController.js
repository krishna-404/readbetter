const LeaderModel = require('../models/leader_model');
const BookModel = require('../models/books_model');

function LeaderController(){

    this.leaderList = function (req,res){
        if(req.params.twitter_id == "allLeaders"){
            LeaderModel.find({}, '-_id -__v -updated_on -updated_by -created_on -created_by', function(err,doc){
                if(err) return next(err);
                res.json(doc);
            });
        } 
        else {
            LeaderModel.findOne({'twitter.id' : req.params.twitter_id}, function(err,doc){
                if(err) return next(err);
                res.json(doc);
        })
        }
    }

    this.newLeader = function (req,res) {
        
        const path = require('path');
              
        const tempPath = req.file.path;
        const fileExt = path.extname(req.file.originalname). toLowerCase();
        const targetPath = `./images/${req.body.twitter_id || req.file.originalname}${fileExt}`;

        let newLeader = new LeaderModel({
            leader_name : req.body.leader,
            click_count: 0,
            twitter: {id: req.body.twitter_id,
                      followers: req.body.twitter_followers},
            images: [{path: targetPath,
                     credits: req.body.image_credits}],
            booksReco: [{name: req.body.book_name,
                         author: req.body.author,
                         ISBN13: req.body.ISBN,
                         amazonLink: req.body.amazonLink,
                         bookImgPath: req.body.bookImgPath,
                         bookImgCredits: req.body.bookImgCredits,
                         whereRecommended: req.body.whereRecommended,
                         whenRecommended: req.body.whenRecommended}],
            created_on  : new Date(),
            created_by  : req.connection.remoteAddress,
            updated_on  : new Date(),
            updated_by  : req.connection.remoteAddress
        })
        
        newLeader.save(function (err) {
            if(err) {
                console.log(err);
                if(err.index = 'twitter.id_1'){
                return res.send("Duplicate twitter id");
                } else {
                    return res.send("Didnot add to database.");
                }
            }
            res.send('Leader created succesfuly');
        })

    };
}

module.exports = LeaderController;
const Leader = require('../models/leader_model');

function LeaderModel(){

    this.dispLeader = function (req,res){
        
        Leader.findOne({'twitter.id' : req.params.twitter_id}, function(err,doc){
            if(err) return next(err);
            res.send(doc)
        })
        
        
        
    }

    this.newLeader = function (req,res){
        
        let newLeader = new LeaderModel({
            leader_name : req.body.leader,
            click_count: 0,
            twitter: {id: req.body.twitter_id,
                      followers: req.body.twitter_followers},
            images: [{path: req.body.image_path,
                     credits: req.body.image_credits}],
            booksReco: [{name: req.body.book_name,
                         author: req.body.author,
                         ISBN: req.body.ISBN}]
        })
        
        newLeader.save(function (err) {
            if(err) {
                return next(err);
            }
            res.send('Leader created succesfuly');
        })
    }
}


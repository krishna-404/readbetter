//const multer = require('multer');


const LeaderModel = require('../models/leader_model');

function LeaderController(){

    this.dispLeader = function (req,res){
        
        Leader.findOne({'twitter.id' : req.params.twitter_id}, function(err,doc){
            if(err) return next(err);
            res.send("success")
        })
    }

    this.newLeader = function (req,res) {
        
        const path = require('path');
        //const fs = require('fs');
      
        const tempPath = req.file.path;
        const fileExt = path.extname(req.file.originalname). toLowerCase();
        const targetPath = `./images/${req.body.twitter_id || req.file.originalname}${fileExt}`;

        // if(fileExt == ".png" || fileExt == ".jpg" || fileExt =="jpeg"){
        //     fs.rename(tempPath, targetPath, err => {
        //         if(err) return res.send("Image Upload Error");
        //     })
        // } else {
        //     fs.unlink(tempPath, err => {
        //         if(err) return res.send("Image Upload Error");

        //         res
        //             .status(403)
        //             .contentType("text/plain")
        //             .end("Only .png / .jpg / .jpeg files are allowed")
        //     })
        // }


        let newLeader = new LeaderModel({
            leader_name : req.body.leader,
            click_count: 0,
            twitter: {id: req.body.twitter_id,
                      followers: req.body.twitter_followers},
            images: [{path: targetPath,
                     credits: req.body.image_credits}],
            booksReco: [{name: req.body.book_name,
                         author: req.body.author,
                         ISBN: req.body.ISBN}]
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
const express = require('express');

const LeaderModel = require('../models/leader_model');
const BookModel = require('../models/books_model');

const app = express();

app.set('view engine', 'ejs');

function DisplayController(){

    this.displayHome = function(req,res){
        LeaderModel.find({}, '-_id -__v -updated_on -updated_by -created_on -created_by').sort('-sort_count').lean().exec((err,doc) => {
            if(err) return res.send(err);
            res.render(process.cwd() + '/views/main/index.ejs', {data: doc})
        });
    }

    this.displayLeader = function(req, res){

        if(req.params.twitter_id == "admin"){
            res.sendFile(process.cwd() + '/views/admin/admin.html')
        } else {
        LeaderModel.findOne({'twitter.id' : req.params.twitter_id}, 
                             '-_id -__v -updated_on -updated_by -created_on -created_by')
                             .lean().exec((err,doc) => {
            if(err) return res.send(err);
            const sort_count = (doc.click_by.length + 1) * (doc.twitter.followers);
            console.log(doc.click_by.length, sort_count, req.connection.remoteAddress )
            LeaderModel.findOneAndUpdate({'twitter.id' : req.params.twitter_id}, 
                                         {$set: {   click_by: req.connection.remoteAddress,
                                                    sort_count: sort_count}},
                                        {new: true})
                                        .lean().exec((err, doc) => {
                                            if (err) return console.log(err);
                                            return console.log(doc);
                                        });
            res.render(process.cwd() + '/views/display_leader/leader_view.ejs', {data: doc})        
            })
        }
    }
}

module.exports = DisplayController;
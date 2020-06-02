const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaderSchema = new Schema ({
    leader_name : {type: String, required: true},
    click_count: {type: Number},
    twitter: {id: {type: String, unique: true},
              followers: {type: Number}},
    images: [{path: {type: String},
             credits: {type: String}}],
    booksReco: [{name: {type: String, required: true},
                 Author: {type: String},
                 ISBN: {type: String, unique: true}}]
})

module.exports = mongoose.model('Leader', leaderSchema)
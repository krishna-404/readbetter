const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaderSchema = new Schema ({
    leader_name : { type: String, required: true},
    click_count : { type: Number},
    twitter     : { id: {type: String, unique: true},
                    followers: {type: Number}},
    images      : [{path: {type: String},
                    credits: {type: String}}],
    booksReco   : [{name: {type: String, required: true},
                    Author: {type: String},
                    ISBN13: {type: String, unique: true},
                    amazonLink: {type: String, unique: true},
                    bookImgPath: {type: String},
                    bookImgCredits: {type: String},
                    whereRecommended: {type: String},
                    whenRecommended: {type: Date}}],
    created_on  : { type: Date },
    created_by  : { type: String},
    updated_on  : { type: Date},
    updated_by  : { type: String}
})

module.exports = mongoose.model('Leader', leaderSchema)
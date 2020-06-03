const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema ({
    book_name   : { type: String, required: true},
    book_author : { type: String},
    ISBN13      : { type: String, unique: true},
    click_by    : [String],
    sort_count  : {type: Number},
    tags        :[String],
    images      : [{path: {type: String},
                    credits: {type: String}}],
    amazonLink  : {type: String, unique: true},
    leadersReco : [{leader_name: {type: String, required: true},
                    twitter_id: {type: String},
                    whereRecommended: {type: String},
                    whenRecommended: {type: Date}}],
    created_on  : { type: Date, default: Date.now },
    created_by  : { type: String},
    updated_on  : { type: Date, default: Date.now},
    updated_by  : { type: String}
})

module.exports = mongoose.model('Book', bookSchema) 
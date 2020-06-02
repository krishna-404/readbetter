const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema ({
    book_name   : { type: String, required: true},
    book_author : { type: String},
    ISBN13      : { type: String, unique: true},
    click_count : { type: Number},
    images      : [{path: {type: String},
                    credits: {type: String}}],
    leadersReco : [{name: {type: String, required: true},
                    twitter_id: {type: String, unique: true},
                    whereRecommended: {type: String},
                    whenRecommended: {type: Date}}],
    created_on  : { type: Date },
    created_by  : { type: String},
    updated_on  : { type: Date},
    updated_by  : { type: String}
})

module.exports = mongoose.model('Book', bookSchema) 
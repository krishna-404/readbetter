const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema ({
    book_name : {type: String, required: true},
    click_count: {type: Number},
    images: [{path: {type: String},
             credits: {type: String}}],
    leadersReco: [{name: {type: String, required: true},
                 twitter_id: {type: String, unique: true},
                 ISBN: {type: String, unique: true}}]
})

module.exports = mongoose.model('Book', bookSchema) 
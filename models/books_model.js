const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  book_name: { type: String, required: true },
  book_author: [String],
  ISBN13: { type: String, unique: true },
  book_desc: { type: String },
  click_by: [String],
  sort_count: { type: Number },
  tags: [String],
  images: [{ path: { type: String }, credits: { type: String } }],
  amazonLink: { type: String, unique: true },
  reco_count: { type: Number },
  leadersReco: [
    {
      leader_name: { type: String, required: true },
      twitter_id: { type: String },
      whereRecommended: { type: String },
      whenRecommended: { type: Date }
    }
  ],
  created_on: { type: Date, default: Date.now },
  created_by: { type: String },
  updated_on: { type: Date, default: Date.now },
  updated_by: { type: String }
});

module.exports = mongoose.model("Book", bookSchema)
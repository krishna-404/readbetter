const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leaderSchema = new Schema({
  leader_name: { type: String, required: true },
  click_by: [String],
  twitter: { id: { type: String, unique: true }, followers: { type: Number } },
  leader_bio: { type: String },
  sort_count: { type: Number },
  images: [{ path: { type: String }, credits: { type: String } }],
  //count_of_tags: {},w
  booksReco: [
    {
      book_name: { type: String },
      author: [String],
      book_desc: { type: String },
      ISBN13: { type: String },
      tags: [String],
      amazonLink: { type: String },
      bookImgPath: { type: String },
      bookImgCredits: { type: String },
      whereRecommended: { type: String },
      whenRecommended: { type: Date },
      leader_comment: {type: String}
    }
  ],
  created_on: { type: Date, default: Date.now },
  created_by: { type: String },
  updated_on: { type: Date, default: Date.now },
  updated_by: { type: String }
});

module.exports = mongoose.model("Leader", leaderSchema);

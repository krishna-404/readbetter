const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  bookName: { type: String, trim: true, required: true },
  bookAuthor: [String],
  ISBN13: { type: String, trim: true, unique: true },
  ISBN10: { type: String, trim: true},
  ASIN: {type: String, trim: true},
  bookDesc: { type: String, trim: true },
  bookTags: [String],
  bookImgPath: { type: String, trim: true },
  amazonLink: { type: String, trim: true, unique: true },
  bookStoryLink: {type: String, trim: true},
  clickBy: [String],
  recoCount: {type: Number},
  leadersReco: [
    {
      leaderDbId: {type: String, trim: true},
      twitterId: {type: String, trim: true},
      whereRecommended: { type: String, trim: true },
      whenRecommended: { type: Date },
      leaderComment: {type: String, trim: true}
    }
  ],
  createdBy: {type: String, trim: true},
  updatedBy: {type: String, trim: true}
},{
  timestamps: true,
  collection: 'books'
});

module.exports = mongoose.model("book", bookSchema)

//clickBy, recoCount
//trim: true
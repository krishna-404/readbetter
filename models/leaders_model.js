const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leaderSchema = new Schema({
  leaderName: { type: String, trim: true },
  leaderSector:  {type:String, trim: true},
  leaderBio: { type: String, trim: true },
  leaderImgPath: { type: String, trim:true},
  leaderStoryLink: {type: String, trim:true},
  twitter: { id: { type: String, trim: true }, followers: { type: Number } },
  booksReco: [{
              id: {type: String, trim: true},
              ISBN13: {type: String, trim: true},
              ISBN10: {type: String, trim: true},
              ASIN: {type: String, trim: true}
            }],
  clickBy: [String],
  sortCount: {type: Number}
},{
  timestamps: true,
  collection: 'leaders'
});

module.exports = mongoose.model("leader", leaderSchema);

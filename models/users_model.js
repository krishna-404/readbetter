const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    twitterId: { type: String, trim: true, required: true },
    twitterHandle: {type: String, trim:true},
    twitterName: {type: String},
    profileName: {type: String},
    twitterBio : {type: String},
    twitterImageUrl : {type: String},
    profileImage:{type: String},
    followersCount: {type: Number},
    friendsCount: {type: Number},
    friendsList :[{
      _id: false,
      friendsTwitterId: {type: String, trim: true},
      friendsTwitterHandle: {type: String, trim: true},
      booksRecoCount: {type: Number}
    }],
    friendsBooks:[{
      _id: false,
      bookId: {type: String, trim: true},
      ISBN13: {type: String, trim: true},
      ISBN10: {type: String, trim: true},
      ASIN: {type: String, trim: true},
      recoCount: {type: Number},
      recommendedBy:[{
        _id: false,
        leaderId: {type: String, trim: true},
        leaderTwitterId: {type: String, trim: true},
        leaderTwitterHandle: {type: String, trim: true}
      }] 
    }],
    listedCount: {type: Number},
    twitterOAuthToken: {type: String},
    twitterOAuthTokenSecret: {type: String},
},{
  timestamps: true,
  collection: 'users'
});

module.exports = mongoose.model("user", userSchema)

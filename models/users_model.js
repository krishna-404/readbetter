const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    twitterId: { type: String, trim: true, required: true },
    pass: {type: String},    
    createdBy: {type: String, trim: true},
    updatedBy: {type: String, trim: true}
},{
  timestamps: true,
  collection: 'users'
});

module.exports = mongoose.model("user", userSchema)

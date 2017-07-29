var mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
   name: String,
   image: { data: Buffer, contentType: String },
   base64: String,
   description: String,
   date: String,
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("Post", postSchema);
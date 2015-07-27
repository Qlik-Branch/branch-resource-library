var mongoose = require('mongoose');
var Schema = mongoose.Schema;

console.log(Schema);

var commentSchema = new Schema({
  commenttext: Buffer,
  pagetext: Buffer,
  dateline: {
    type: Date,
    default: Date.now
  },
  threadid: Schema.ObjectId,
  userid: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  edituser: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  createuser: {
    type: Schema.ObjectId,
    ref: 'user'
  }
});

module.exports = mongoose.model('comment', commentSchema)

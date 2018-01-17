var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var resourceSchema = new Schema({
  title: String,
  content: Buffer,
  plaintext: String,
  tags: String,
  category: {
    type: Schema.ObjectId,
    ref: 'picklistitem'
  },
  createdate: {
    type: Date,
    default: Date.now
  },
  createdate_num: Number,
  last_updated: Date,
  last_updated_num: Number,  
  userid: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
  resourceType: {
      type: Schema.ObjectId,
      ref: 'picklistitem'
  },
  hide_comment: String,
  edituser: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
  createuser: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
  approved:{
    type: Boolean,
    default: false
  },
  flagged:{
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('resource', resourceSchema)

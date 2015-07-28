var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projectSchema = new Schema({
  title: String,
  content: String,
  short_description: String,
  thumbnail: Buffer,
  overview: String,
  createdate: Date,
  last_updated: Date,
  last_git_check: Date,
  project_site: String,
  git_clone_url: String,
  git_repo: String,
  git_user: String,
  threadid: String,
  taglist: Buffer,
  approved: {
    type: Boolean,
    default: true
  },
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
    ref: 'users'
  },
  forumid: {
    type: Schema.ObjectId,
    ref: 'projectcategories'
  },
  product: {
    type: Schema.ObjectId,
    ref: 'products'
  }
});

module.exports = mongoose.model('project', projectSchema)

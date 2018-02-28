var User = require('../../models/user');
var UserProfile = require('../../models/userprofile');
var LoginHistory = require('../../models/loginhistory');
var marketo = require('../../marketo/marketo')

module.exports = function(passport){

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    UserProfile.findOne({"_id": id}).populate('role').exec(function(err, user) {
      if(!user.branch_firstaccess) {
        marketo.updateIncentive(user)
            .then((updated) => {
              if(updated) {
                user.branch_firstaccess = true
                user.save(function(err, result) {
                  if(err) {
                    console.error("passport.js - user.save - branch_firstaccess")
                    console.error(err)
                  }
                  done(err, user);
                })
              } else {
                done(err, user);
              }
            })
      } else {
        done(err, user);
      }
    });
  });

  //Configure login strategies
  require('./login.js')(passport, User, UserProfile, LoginHistory);
  require('./gitlogin.js')(passport, User, UserProfile, LoginHistory);

  //configure signup strategy
  require('./signup.js')(passport, User, UserProfile);
}

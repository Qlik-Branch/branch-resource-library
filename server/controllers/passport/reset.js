var LocalStrategy = require('passport-local').Strategy,
		User = require('../../models/user'),
		UserProfile = require('../../models/userprofile'),
    crypto = require('crypto'),
		bCrypt = require('bcryptjs'),
		md5 = require('MD5'),
		async = require('async'),
		_ = require('underscore'),
		mailer = require('../emailer'),
    config = require('config'),
    Error = require('../error');

module.exports = function(req, res, next){
  var shared = {}

  async.series([

    // check user exists
    function(next) {
			UserProfile.findOne({ 'email' : req.body.email }, function(err, userProfile) {
				if (err){
					res.json(Error.custom(err));
				}
				else{
					if (!userProfile) {
						res.json(Error.custom('User Not Found with email - '+req.body.email));
					}
					else {
						shared.userProfile = userProfile;
            next()
					}
				}
			});
    },

    // create random string
    function(next) {
      var current_date = (new Date()).valueOf().toString();
      var random = Math.random().toString();
      shared.randomHash = crypto.createHash('sha1').update(current_date + random).digest('hex');
      next();
    },

    function(next) {

      // set the user's local credentials
      shared.userProfile.resetHash = shared.randomHash

      // save the user
      shared.userProfile.save(function(err) {
        if (err){
					res.json(Error.custom(err));
				}
        console.log('Password reset successful');
        next();
      })
    },

    function(next) {

      // setup email data
      var mailOptions = {
				from: 'Qlik Branch <svc-branchadminmail@qlik.com>',
        to: shared.userProfile.email,
        subject: 'Qlik Branch Password reset',
        html: `<p>You are receiving this because a request was made to reset the password for your Branch account.</p>
         <p>Please click <a href="${config.baseUrl}/auth/reset/${shared.userProfile.resetHash}">here</a> or copy and paste the link below to change your password</p>
         <p>${config.baseUrl}/auth/reset/${shared.userProfile.resetHash}</p>`
      }

      // send email with new password
      mailer.sendCustomMail(mailOptions, function(){
			  res.json({});
      })
    }

  ])
	// , function(err) {
  //   if (err) return next(err.message, false)
  //   next(null, shared.user)
  // })
}

var getRandomString = function(length) {
	var set = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	return _.shuffle(set.split('')).splice(0, length).join('')
}
// Generates hash using bCrypt
var createSalt = function(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null)
}

var hashPassword = function(password, salt) {
  return md5(md5(password) + salt)
}

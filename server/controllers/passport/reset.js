var LocalStrategy = require('passport-local').Strategy,
		User = require('../../models/user'),
		UserProfile = require('../../models/userprofile'),
		bCrypt = require('bcryptjs'),
		md5 = require('MD5'),
		async = require('async'),
		_ = require('underscore'),
		mailer = require('../emailer'),
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
						User.findOne({'_id': userProfile._id}, function(err, user){
			        if (err){
								res.json(Error.custom(err));
							}
							else{
								shared.user = user;
				        next();
							}
			      });
					}
				}
			});
    },

    // create new password
    function(next) {
      shared.newPassword = getRandomString(8);
      next();
    },

    function(next) {

      // set the user's local credentials
      shared.user.salt = createSalt(shared.newPassword)
      shared.user.password = hashPassword(shared.newPassword, shared.user.salt)

      // save the user
      shared.user.save(function(err) {
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
        subject: 'Password reset',
        html: '<p>You are receiving this because you have requested the reset of the password for your account.</p>' +
         '<p>Please use the following temporary password to access your account - <b>' + shared.newPassword + '</b></p>' +
         '<p>Once logged in we recommend that you update your password as soon as possible.</p>'
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

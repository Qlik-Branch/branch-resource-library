var LocalStrategy = require('passport-local').Strategy
var bCrypt = require('bcryptjs')
var md5 = require('MD5')
var async = require('async')
var spamCheck = require('spam-check')
var spamchecker = require('known-spam-emails')

module.exports = function(passport, User){

	passport.use('signup', new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
      var shared = {}

      async.series([

        // spam checking
        function(next) {
          spamCheck({ string: [username, password, req.body.email].join(' ') }, function(err, results) {
            if (err) return next(err)

            if (results.spam || !spamchecker.isEmailClean(req.body.email)) {
              console.log('User blocked by spam filter system.')
              return done('User blocked by spam filter system.', false)
            }

            next()
          })
        },

        // check user already exists
        function(next) {
          User.findOne({ $or: [{ username: username }, { email: req.body.email }]  }, function(err, user) {
            if (err) return next(err)

            if (user) {
							if(user.username == username){
              	return done('User already exists with username "' + username + '"', false)
							}
							else if (user.email == req.body.email) {
								return done('User already exists with email "' + req.body.email + '"', false)
							}
							else{
								//both the username & emails are in use (rare)
								return done('User already exists with username "' + username + '" and email "' + req.body.email + '"', false)
							}
            }

            next()
          })
        },

        // create new user
        function(next) {
          var newUser = new User(req.body)

          // set the user's local credentials
          newUser.salt = createSalt(password)
          newUser.password = hashPassword(password, newUser.salt)

          // save the user
          newUser.save(function(err) {
            if (err) return next(err)

            console.log('User Registration succesful')
            shared.newUser = newUser

            next()
          })
        }

      ], function(err) {
        if (err) return done(err.message, false)
        done(null, shared.newUser)
      })
    })
  )

  // Generates hash using bCrypt
  var createSalt = function(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null)
  }

	var hashPassword = function(password, salt) {
    return md5(md5(password) + salt)
  }

}

var LocalStrategy    = require('passport-local').Strategy;
var bCrypt = require('bcryptjs');
var md5 						 = require('MD5');

module.exports = function(passport, User){

	passport.use('signup', new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {

            findOrCreateUser = function(){
							User.findOne({username: username}, function(err, user){
								if(user){
									console.log('User already exists with username "'+username+'"');
									return done('User already exists with username "'+username+'"', false);
								}
								else{
									User.findOne({email: req.body.email}, function(err, user){
										if(user){
											console.log('User already exists with email "'+req.body.email+'"');
											return done('User already exists with email "'+req.body.email+'"', false);
										}
										else{
											var newUser = new User(req.body);

											// set the user's local credentials
											newUser.salt = createSalt(password);
											newUser.password = hashPassword(password, newUser.salt);

											// save the user
											newUser.save(function(err) {
													if (err){
															console.log('Error in Saving user: '+err);
															throw err;
													}
													console.log('User Registration succesful');
													return done(null, newUser);
											});
										}
									});
								}
							});
            };
            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateUser);
        })
    );

    // Generates hash using bCrypt
    var createSalt = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }

		var hashPassword = function(password, salt){
        return md5(md5(password)+salt);
    }

}

var LocalStrategy    = require('passport-local').Strategy;
var md5 						 = require('MD5');

module.exports = function(passport, User, UserProfile, LoginHistory){
	passport.use('local', new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, username, password, done) {
            // check in mongo if a user with username exists or not
						var regExp = new RegExp("^"+username+"$", "i");
            UserProfile.findOne({ 'username' : {$regex: regExp} },
                function(err, userProfile) {
                    // In case of any error, return using the done method
                    if (err){
                      console.error("login.js - UserProfile.findOne")
											console.error(err);
                      return done(err.message);
										}
                    // Username does not exist, log the error and redirect back
                    if (!userProfile){
                        return done('User Not Found with username - '+username, false);
                        //return done(null, false, req.flash('message', 'User Not found.'));
                    }
										if(userProfile.linked_to_github==true){
											return done("Your user account has been linked to the GitHub user "+ userProfile.github_user+". Please use the 'Login With GitHub' option below.", false);
										}
										if(userProfile.approved==false){
											return done("Your user account has been blocked. Please contact branch.admin@qlik.com", false);
										}
										//get the main user info and validate the Password
										User.findOne({'_id': userProfile._id}, function(err, user){
											if (!isValidPassword(user, password)){
	                        return done('Invalid Password', false);
	                        //return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
	                    }
	                    // User and password both match, return user from done method
	                    // which will be treated like success
											LoginHistory.create({userid: user._id}, function(err, result){
												userProfile.lastvisit = result.createdate;
												userProfile.lastvisit_num = result.createdate.getTime();
												userProfile.save(function(err){

												});
											});
											return done(null, user);
										});


                }
            );

        })
    );


    var isValidPassword = function(user, password){
        return (md5(md5(password)+user.salt)) == user.password;
    }

}

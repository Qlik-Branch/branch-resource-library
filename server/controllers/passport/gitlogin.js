var LocalStrategy    = require('passport-local').Strategy;
var md5 						 = require('MD5');

module.exports = function(passport, User, UserProfile, LoginHistory){
	passport.use('gitlogin', new LocalStrategy({
            usernameField : 'username',
						passwordField : 'password',
            passReqToCallback : true
        },
        function(req, username, password, done) {
            // check in mongo if a user with username exists or not
            UserProfile.findOne({ github_user : username },
                function(err, userProfile) {
                    // In case of any error, return using the done method
                    if (err){
                        console.error("gitlogin.js - UserProfile.findOne")
												console.error(err);
                        return done(err.message, false);
										}
                    // Username does not exist, log the error and redirect back
                    if (!userProfile){
                        return done('User Not Found with username - '+username, false);
                        //return done(null, false, req.flash('message', 'User Not found.'));
                    }
										if(userProfile.approved==false){
											return done("Your user account has been blocked. Please contact branch.admin@qlik.com", false);
										}
										//get the main user info and validate the Password
										User.findOne({'_id': userProfile._id}, function(err, user){
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
}

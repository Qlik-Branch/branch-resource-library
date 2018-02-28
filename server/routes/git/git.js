var express = require("express"),
    router = express.Router(),
    Project = require("../../models/project"),
    git = require("github"),
    atob = require("atob"),
    Auth = require("../../controllers/auth"),
    Error = require("../../controllers/error"),
    Config = require("config"),
    MasterController = require("../../controllers/master"),
    entities = require("../entityConfig"),
    request = require("request"),
    passport = require('passport'),
    GitHub = new git({
        // required
        version: "3.0.0",
        // optional
        debug: false,
        protocol: "https",
        host: "api.github.com", // should be api.github.com for GitHub
        pathPrefix: "", // for some GHEs; none for GitHub
        timeout: 30000,
        headers: {
            "user-agent": Config.git.userAgent // GitHub is happy with a unique user agent
        }
    });

router.get("/updatereadme/:id", function(req, res){
  if(!req.user){
    res.json({errorCode: 401, errorText: "User not logged in", redirect: "#!login"});
  }
  else{
    Project.findOne({_id: req.params.id}, function(err, result){
      if(err){
        res.json(Error.custom(err));
      }
      else{
        if(!result){
          res.json(Error.noRecord());
        }
        else {
          if(result.userid==req.user._id || req.user.role.name=="admin"){
            var repo = result.git_repo;
            var gituser = result.git_user;
            var parts = result.project_site.split("/");
            parts = parts.filter(Boolean);
            if(parts){
              if(!repo){  //if the repo has not been set correctly we'll grab it from the project_site.
                var repo = parts.pop();
                result.git_repo = repo;
                var gituser = parts.pop();        //chances are if the repo is bad then the owner is bad too
                result.git_user = gituser;
              }
            }
            GitHub.authenticate({type: "token", token: Config.git.token });
            GitHub.repos.getReadme({owner:gituser, repo:repo, headers:{accept: 'application/vnd.github.VERSION.raw'}}, function(err, readmeresult){
              if(err){
                console.error("git.js - router.get - /updatereadme/:id - GitHub.repos.getReadme")
                console.error(err);
              }
              GitHub.authenticate({type: "token", token: Config.git.token });
              GitHub.misc.renderMarkdownRaw(readmeresult, function(err, htmlresult){
                if(err){
                  console.error("git.js - router.get - /updatereadme/:id - GitHub.misc.renderMarkdownRaw")
                  console.error(err);
                  res.json(Error.custom(err));
                }
                else{
                  htmlresult = htmlresult.data
                  htmlresult = htmlresult.replace(/href="((?!http)[^>]*)"/gim, "href=\"https://github.com/"+gituser+"/"+repo+"/raw/master/$1\"")
                  htmlresult = htmlresult.replace(/src="((?!http)[^>]*)"/gim, "src=\"https://github.com/"+gituser+"/"+repo+"/raw/master/$1\"")
                  result.content = htmlresult;
                  result.save(function(err){
                    if(err){
                      console.error("git.js - router.get - /updatereadme/:id - result.save")
                      console.error(err);
                    }
                  });
                  res.json(result || {});
                }
              });
            });
          }
          else {
            res.json(Error.insufficientPermissions());
          }
        }
      }
    });
  }
});

router.get("/link", function(req, res){
  authorizeGit(`${Config.git.redirectHost}/git/linkauthorized`, req, res);
});

router.get("/unlink", function(req, res){
  req.user.linked_to_github = false;
  req.user.save(function(err, result){
    if(err){
      console.error("git.js - router.get - /unlink - req.user.save")
      console.error(err);
    }
    else{
      //res.json({});
      res.redirect("/#!user/"+req.user._id+"/edit");
    }
  });
});

router.use("/linkauthorized", function(req, res){
  if(req.query){
    //the account has been authorized
    //now we authenticate and get a token and the authenticated user
    var data = req.query;
    getAccessTokenAndUser(data, function(data){
      if(!req.user){
        res.redirect("/login");
      }
      else{
        req.user.linked_to_github = true;
        req.user.github_user = data.user.login;
        req.session.gitToken = data.response.access_token;
        req.user.save(function(err, result){
          if(err){
            console.error("git.js - router.use - /linkauthorized - req.user.save")
            console.error(err);
          }
          else{
            //res.json({});
            res.redirect("/#!user/"+req.user._id+"/edit");
          }
        });
      }
    });
  }
});

router.get("/login", function(req, res){
  if(req.query.url && req.query.url !== "") {
    req.session.url = req.query.url;
  } else if (req.session.url) {
    delete req.session.url;
  }
  authorizeGit(`${Config.git.redirectHost}/git/loginsuccessful`, req, res);
});

router.use("/loginsuccessful", function(req, res, next){
  if(req.query){
    //the account has been authorized
    //now we authenticate and get a token and the authenticated user
    var data = req.query;
    getAccessTokenAndUser(data, function(data){
      var query = {
        github_user: data.user.login
      };
      //now we need to find a user with the returned github login
      MasterController.get(query, query, entities["userprofile"], function(results){
        if(results.errCode){
          req.session.lastError = results;
        }
        else{
          if(results.data.length == 0){
            req.session.lastError = Error.custom("No user found that is linked to '"+data.user.login+"'. If you are already registered and would like to link your user to GitHub you can do so in your 'My Profile' section.");
            res.redirect('/#!loginsignup');
          }
          else{
            if(results.data[0].linked_to_github==false){
              req.session.lastError = Error.custom("No user found that is linked to '"+data.user.login+"'. If you are already registered and would like to link your user to GitHub you can do so in your 'My Profile' section.");
              res.redirect('/#!loginsignup');
            }
            else{
              //we need to login now
              req.session.lastError = null;
              req.session.gitToken = data.response.access_token;
              req.body.username = data.user.login;
              req.body.password = "na";
              passport.authenticate('gitlogin', function(err, user){
                if(err){
                  req.session.lastError = Error.custom(err);
                  res.redirect('/#!loginsignup');
                }
                else{
                  req.logIn(user, function(err){
                    if(err){
                      console.error("git.js - router.use - /loginsuccessful - req.logIn")
                      console.error(err)
                      req.session.lastError = Error.custom(err);
                      res.redirect('/#!loginsignup');
                    }
                    else{
                      if(req.session.url) {
                        var redirectUrl = req.session.url;
                        delete req.session.url;
                        var pattern = /^https?:\/\//i;
                        if (pattern.test(redirectUrl))
                        {
                          res.redirect(redirectUrl);
                        } else {
                          res.redirect("/#!" + redirectUrl);
                        }
                      }
                      else {
                        res.redirect('/');
                      }
                    }

                  })
                }
              })(req, res, next);
            }
          }
        }
      });
    });
  }
});

router.get("/signup", function(req, res){

});

function authorizeGit(redirectUrl, req, res){
  req.session.lastError = null;
  var state = getRandomString(7);
  //this fires the authorize endpoint and redirects back to x
  res.redirect(307, "https://github.com/login/oauth/authorize?client_id="+Config.git.client_id+"&redirect_uri="+redirectUrl+"&scope=read:org&state="+state);
}

function getAccessTokenAndUser(data, callbackFn){
  var url = "https://github.com/login/oauth/access_token";
  data.client_id = Config.git.client_id;
  data.client_secret = Config.git.secret;
  request({url: url, formData: data}, function(err, response, body){
    if(err){
      console.error("git.js - getAccessTokenAndUser - request - " + url)
      console.error(err);
      callbackFn.call(null, {err:err});
    }
    else{
      var responseData = {};
      var params = body.split("&");
      for(var i=0;i<params.length;i++){
        var parts = params[i].split("=");
        responseData[parts[0]] = parts[1];
      }
      GitHub.authenticate({type: "oauth", token: responseData.access_token});
      GitHub.users.get({}, function(err, user){
        if(err){
          console.error("git.js - getAccessTokenAndUser - GitHub.users.get")
          console.error(err);
          callbackFn.call(null, {err:err});
        }
        else{
          callbackFn.call(null, {response: responseData, user:user});
        }
      });
    }
  });
}

function getRandomString(length){
  var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

module.exports = router;

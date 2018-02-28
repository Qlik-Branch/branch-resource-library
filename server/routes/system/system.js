var express = require('express'),
    router = express.Router(),
    Error = require('../../controllers/error'),
    MasterController = require('../../controllers/master'),
    git = require("github"),
    GitHub = new git({
        // required
        version: "3.0.0",
        // optional
        debug: false,
        protocol: "https",
        host: "api.github.com", // should be api.github.com for GitHub
        pathPrefix: "", // for some GHEs; none for GitHub
        timeout: 5000,
        headers: {
            "user-agent": "qlik-branch" // GitHub is happy with a unique user agent
        }
    });

router.get('/userInfo', function(req, res){
  var menu = buildMenu(req.user);
  var userNoPassword = {};
  if(req.user&&req.user.role){
    userNoPassword = cloneObject(req.user);
    delete userNoPassword["password"];
  }
  res.json({
    user: userNoPassword,
    menu: menu
  });
});

router.get('/lasterror', function(req, res){
  if(req.session && req.session.lastError){
    res.json(req.session.lastError);
  }
  else{
    res.json({});
  }
});

router.post('/git/projects', function(req, res){
  try{
    var gitUser;
    if (req.session.gitToken) {
      GitHub.authenticate({type: "oauth", token: req.session.gitToken});
      gitUser = req.user.github_user;
    }
    else {
      res.json(Error.custom("Unable to authenticate. Please contact branch.admin@qlik.com"));
    }
    if (req.body.search) {
      var query = req.body.search + "+user:" + gitUser;
      GitHub.search.repos({q: query}, function(err, repos) {
        if(err){
          console.error("system.js - router.post - /git/projects - GitHub.search.repos")
          console.error(err);
          res.json(Error.custom(err.message));
        }
        else{
          res.json({repos: repos && repos.items ? repos.items : [] });
        }
      });
    } else {

    GitHub.repos.getAll({user:gitUser, page: req.body.page}, function(err, repos){
      if(err){
        console.error("system.js - router.post - /git/projects - GitHub.repos.getAll")
        console.error(err);
        res.json(Error.custom(err.message));
      }
      else{
        res.json({repos: repos, nextPage: GitHub.hasNextPage(repos) ? req.body.page+1 : 0, prevPage: GitHub.hasPreviousPage(repos) ? req.body.page-1 : 0 });
      }
    });
    }
  }
  catch(ex){
    console.error("system.js - router.post - /git/projects - try/catch")
    console.error(ex);
    res.json(Error.custom("Unable to authenticate"));
  }
});

function buildMenu(user){
  var topMenu;
  var basicMenu = [
    {
      label: "Logout",
      href: "/auth/logout"
    }
  ];
  if(user){
    basicMenu.splice(0,0,{
      label: "Change Password",
      href: "#!user/changepassword"
    });
    basicMenu.splice(0,0, {
      label: "My Profile",
      href: "#!user/" + user._id
    });
    if(user.role.permissions && user.role.permissions.resource && user.role.permissions.resource.create==true){
      basicMenu.splice(0,0,{
        label: "Impart Knowledge",
        href: "#!knowledge/new/edit"
      });
    }
    if(user.role.permissions && user.role.permissions.project && user.role.permissions.project.create==true){
      basicMenu.splice(0,0,{
        label: "Create Project",
        href: "#!project/new/edit"
      });
    }
    topMenu = {
      items:[{
        label: user.username.length > 15 ? `${user.username.substring(0,12)}...` : user.username,
        items: []
      }]
    };
    //establish whether or not the user has "moderator" permissions
    if(user.role.permissions){
      var strPerm = JSON.stringify(user.role.permissions);
      if(strPerm.indexOf('"hide":true')!=-1 || strPerm.indexOf('"approve":true')!=-1 || strPerm.indexOf('"flag":true')!=-1){
        basicMenu.splice(0,0, {
          label: "Moderator Console",
          href: "#!moderator"
        });
      }
    }
    //establish whether or not the user is an admin
    if(user.role.name=="admin"){
      basicMenu.splice(0,0, {
        label: "Admin Console",
        href: "#!shouldntbeabletoguessthisurl"
      });
    }
    topMenu.items[0].items = basicMenu;
  }
  else{
    topMenu = {
      items:[{
        label: "Login",
        href: "#!loginsignup",
        items: []
      }]
    };
  }
  return topMenu;
}

function cloneObject(object){
  var clone = {};
  for (var key in object){
    clone[key] = object[key];
  }
  return clone;
}

module.exports = router;

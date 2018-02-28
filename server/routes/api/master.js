var async = require('async'),
    express = require("express"),
    mongoose = require("mongoose"),
    router = express.Router(),
    Auth = require("../../controllers/auth"),
    Error = require("../../controllers/error"),
    MasterController = require("../../controllers/master"),
    entities = require("../entityConfig"),
    epoch = require("milli-epoch"),
    Notifier = require("../../controllers/notifier"),
    git = require("github"),
    atob = require("atob"),
    Config = require("config"),
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

//load in the functions
var createupdate = require("./createupdate");
var imageupload = require("./imageupload");
var imagedelete = require("./imagedelete");
const userexport = require('./userexport')
var read = require("./read");
var update = require("./update");
var flag = require("./flag");
var hide = require("./hide");
var approve = require("./approve");
var get = require("./get")

GitHub.authenticate({type: "token", token: Config.git.token });

router.get("/bucket", function(req, res) {
  res.json(Config.s3);
});

router.get("/export/:year?", userexport)

//This route is for getting a list of results for the specified entity
//url parameters can be used to add filtering
//Requires "read" permission on the specified entity
router.get("/:entity", Auth.isLoggedIn, function(req, res, next){
  var queryObj = parseQuery(req.query || {}, req.body || {}, "GET", entities[req.params.entity]);
  var query = queryObj.query;
  var entity = queryObj.entity;
  var user = req.user;
  var userPermissions;
  if(req.user){
    userPermissions = req.user.role.permissions[req.params.entity];
  }
  //check that the user has sufficient permissions for this operation
  if((!userPermissions || userPermissions.read!=true) && entity.requiresAuthentication){
    res.json(Error.insufficientPermissions("Unable to get "+req.params.entity));
  }
  else{
    // if((userPermissions && userPermissions.allOwners!=true) && entity.exemptFromOwnership!=true && !entity.requiresAuthentication){
    //   query["createuser"]=user._id;
    // }

    //add filter for approved items
    if((userPermissions && userPermissions.approve!=true && entity.exemptFromApproval!=true)
        || (!user && entity.exemptFromApproval!=true)){
          query.$or = [];
          query.$or.push({approved:true});
          if(user){
            query.$or.push({userid: user["_id"] });
          }
    }
    MasterController.get(req.query, query, entity, function(results){
      res.json(results || {});
    });
  }
});

//This route is for getting a count of results for the specified entity
//url parameters can be used to add filtering
//Requires "read" permission on the specified entity
router.get("/:entity/count", Auth.isLoggedIn, function(req, res){
  var queryObj = parseQuery(req.query || {}, req.body || {}, "GET", entities[req.params.entity]);
  var query = queryObj.query;
  var entity = queryObj.entity;
  var user = req.user;
  var userPermissions;
  //check that the user has sufficient permissions for this operation
  if(req.user){
    userPermissions = req.user.role.permissions[req.params.entity];
  }
  //check that the user has sufficient permissions for this operation
  if((!userPermissions || userPermissions.read!=true) && entity.requiresAuthentication){
    res.json(Error.insufficientPermissions("Unable to count "+req.params.entity));
  }
  else{
    // if((userPermissions && userPermissions.allOwners!=true) && entity.exemptFromOwnership!=true && !entity.requiresAuthentication){
    //   query["createuser"]=user._id;
    // }
    if((userPermissions && userPermissions.approve!=true && entity.exemptFromApproval!=true)
        || (!user)){
          query.$or = [];
          query.$or.push({approved:true});
          if(user){
            query.$or.push({userid: user["_id"] });
          }
    }
    MasterController.count(req.query, query, entity, function(results){
      res.json(results);
    });
  }
});

router.get("/:entity/hidden", Auth.isLoggedIn, read.getHidden);
router.get("/:entity/flagged", Auth.isLoggedIn, read.getFlagged);

router.get("/publication/:id", (req, res) => {
  req.params.entity = "publication"
  let queryObj = parseQuery(req.query || {}, req.body || {}, "GET", entities[req.params.entity]);
  let entity = queryObj.entity;
  let query = {
    originalId: req.params.id
  }
  MasterController.get(req.query, query, entity, (results) => {
    if(results.data.length > 0) {
      res.json({ link: results.data[0].link })
    } else {
      res.json({})
    }
  });
})

//This route is for getting a specific result from the specified entity
//url parameters can be used to add filtering
//Requires "read" permission on the specified entity
//If the requested entity is "projects" then we check first to see if the latest
//data has been fetched from git within the last hour. If not we need to update the db
//with the latest data from git. Otherwise we return the document from mongo
router.get("/:entity/:id", Auth.isLoggedIn, function(req, res){
  var queryObj = parseQuery(req.query || {}, req.body || {}, "GET", entities[req.params.entity]);
  var query = queryObj.query;
  var entity = queryObj.entity;
  query["_id"] = req.params.id;
  var user = req.user;
  var userPermissions;
  //check that the user has sufficient permissions for this operation
  if(req.user){
    userPermissions = req.user.role.permissions[req.params.entity];
  }
  //check that the user has sufficient permissions for this operation
  if((!userPermissions || userPermissions.read!=true) && entity.requiresAuthentication){
    res.json(Error.insufficientPermissions("Unable to get "+req.params.entity));
  }
  else{
    // if((userPermissions && userPermissions.allOwners!=true) && entity.exemptFromOwnership!=true && !entity.requiresAuthentication){
    //   query["createuser"]=user._id;
    // }
    if((userPermissions && userPermissions.approve!=true && entity.exemptFromApproval!=true)
        || (!user)){
      query.$or = [];
      query.$or.push({approved:true});
      if(user){
        query.$or.push({userid: user["_id"] });
      }
    }
    MasterController.get(req.query, query, entity, function(results){
      if(entity.logViews){
        //check to see if the current user or IP Address has viewed the same item
        //in the last hour. If not add an item to the views table
        var anHourAgo = (new Date()).getTime() - (360000);
        var ip = -1;
        if(req.ip){
          ip = req.ip.split(":").pop();
        }
        var viewQuery = {
          createdate: {
            $gt: anHourAgo
          },
          entityId: req.params.id
        };
        if(req.user){
          viewQuery.userid = req.user._id;
        }
        else{
          viewQuery.ip = ip;
        }
        MasterController.get(viewQuery, viewQuery, entities["view"], function(results){
          if(results.data && results.data.length == 0){
            var viewData = {};
            if(req.user){
              viewData.userid = req.user._id;
            }
            viewData.ip = ip;
            viewData.entityId = req.params.id;
            MasterController.save(null, viewData, entities["view"], function(result){

            });
          }
        });

      }
      if(req.params.entity=="project"&&(results.data && results.data[0] && results.data[0].git_repo && ((results.data[0].last_git_check && results.data[0].last_git_check.getTime() < anHourAgo)||(!results.data[0].last_git_check)))){
        //if we're here then the following criteria has been met
        // - entity == "projects"
        // - project has a project_site
        // - the git details have not been updated for an hour +
        var repo = results.data[0].git_repo;
        var gituser = results.data[0].git_user;
        GitHub.authenticate({type: "token", token: Config.git.token });
        GitHub.repos.get({owner:gituser, repo:repo}, function(err, gitresult){
          if(err){
            console.error("master.js - router.get - /:entity/:id - GitHub.repos.get - " + req.params.entity)
            console.error(err.message)
            // there was an issue getting the latest from github.
            // we won't do anything with the problem at the moment,
            // but we don't want to send an error back to the site,
            // so just return what we have
            res.json(results || {});
          }
          else{
            //update the update date and git check data
            //Note: Using pushed_at instead of updated_at from Github to fetch latest commit date.
            //TODO <akl@qlik.com>: Only trigger on updates to the master branch.
            var hasChanged = results.data[0].last_updated_num!=(new Date(gitresult.pushed_at)).getTime();
            if(hasChanged){
              results.data[0].last_updated = new Date(gitresult.pushed_at);
              results.data[0].last_updated_num = (new Date(gitresult.pushed_at)).getTime();
              results.data[0].last_git_check = Date.now();
              GitHub.authenticate({type: "token", token: Config.git.token });
              GitHub.repos.getReadme({owner:gituser, repo:repo, headers:{accept: 'application/vnd.github.VERSION.raw'}}, function(err, readmeresult){
                if(err){
                  console.error("master.js - router.get - /:entity/:id - GitHub.repos.getReadme")
                  console.error(err);
                }
                GitHub.authenticate({type: "token", token: Config.git.token });
                GitHub.misc.renderMarkdownRaw(readmeresult, function(err, htmlresult){
                  if(err){
                    console.error("master.js - router.get - /:entity/:id - GitHub.misc.renderMarkdownRaw")
                    console.error(err);
                  }
                  else{
                    htmlresult = htmlresult.data
                    htmlresult = htmlresult.replace(/href="((?!http)[^>]*)"/gim, "href=\"https://github.com/"+gituser+"/"+repo+"/raw/master/$1\"")
                    htmlresult = htmlresult.replace(/src="((?!http)[^>]*)"/gim, "src=\"https://github.com/"+gituser+"/"+repo+"/raw/master/$1\"")
                    results.data[0].content = htmlresult;
                    results.data[0].save(function(err){
                      if(!err){
                        Notifier.sendUpdateNotification(results.data[0]._id, results.data[0], req.params.entity);
                      }
                    });
                  }
                  res.json(results || {});
                })
              });
            }
            else{
              res.json(results || {});
            }
          }
        });
      }
      else{
        res.json(results || {});
      }
    });
  }
});

//This route is for fetching the thumbnail image assigned to a given entity document
//Authnetication requirements to be defined
router.get('/:entity/:id/thumbnail', Auth.isLoggedIn, function(req, res){
  MasterController.getThumbnail({_id: req.params.id}, entities[req.params.entity], function(result){
    if(result){
      res.send(result.thumbnail);
    }
    else {
      res.send(Error.noRecord());
    }
  });
});

//router.post("/projects", Auth.isLoggedIn, create.createProject);
router.post("/:entity", Auth.isLoggedIn, createupdate);
router.post("/:entity/image", Auth.isLoggedIn, imageupload);
router.delete("/:entity/image/:url", Auth.isLoggedIn, imagedelete);
//router.post("/projects/:id", Auth.isLoggedIn, update.updateProject);
router.post("/:entity/:id", Auth.isLoggedIn, createupdate);
router.post("/:entity/:id/flag", Auth.isLoggedIn, flag.flag);
router.post("/:entity/:id/unflag", Auth.isLoggedIn, flag.unflag);
router.post("/:entity/:id/hide", Auth.isLoggedIn, hide);
router.post("/:entity/:id/approve", Auth.isLoggedIn, approve);
router.post("/:entity/rating/my", Auth.isLoggedIn, get.getMyRating);

//This route is for deleting a list of records on the specified entity
//url parameters can be used to add filtering
//Requires "delete" permission on the specified entity
// router.delete("/:entity", Auth.isLoggedIn, function(req, res){
//   var query = req.query || {};
//   var entity = req.params.entity;
//   var user = req.user;
//   var userPermissions = req.user.role.permissions[entity];
//   if(!userPermissions || userPermissions.delete!=true){
//     res.json(Error.insufficientPermissions());
//   }
//   else{
//     if(userPermissions.allOwners!=true){
//       query["createuser"]=user._id;
//     }
//     MasterController.delete(query, entities[entity], function(result){
//       res.json(result);
//     });
//   }
// });

//This route is for deleting a specific record on the specified entity
//url parameters can be used to add filtering
//Requires "delete" permission on the specified entity
router.delete("/:entity/:id", Auth.isLoggedIn, function(req, res){
  var query = req.query || {};
  query["_id"] = req.params.id;
  var entity = req.params.entity;
  var user = req.user;
  var userPermissions = req.user.role.permissions[entity];
  if(!userPermissions || userPermissions.delete!=true){
    res.json(Error.insufficientPermissions());
  }
  else{
    if(userPermissions.allOwners!=true){
      query["userid"]=user._id;
    }
    MasterController.delete(query, entities[entity], function(result){
      //need to delete any comments and flags
      res.json(result);
    });
  }
});

//this function parses any sorting or paging parameters and contstructs the mongodb query accordingly.
//Currently only used for GET requests
function parseQuery(query, body, method, originalEntity){
  var entity = cloneObject(originalEntity);
  var mongoQuery = {};
  query = query || {};
  body = body || {};
  if(query.sort){
    var sortFields = query.sort.toString().split(",");
    var sortOrders = query.sortOrder.toString().split(",");
    var sort = {};
    for(var i=0; i < sortFields.length; i++){
      sort[sortFields[i]] = sortOrders[i] || 1;
    }
    entity.sort = sort;
    delete query["sort"];
    delete query["sortOrder"];
  }
  entity.skip = Number(query.skip || entity.skip || 0);
  entity.limit = Number(query.limit || entity.limit || 0);
  delete query["skip"];
  delete query["limit"];

  if(method=="GET"){
    query = concatObjects([query, body]);
  }

  mongoQuery.entity = entity;
  mongoQuery.query = query;

  return mongoQuery;
}

function cloneObject(object){
  var clone = {};
  for (var key in object){
    clone[key] = object[key];
  }
  return clone;
}

function concatObjects(objects){
  var result = {};
  for (var o in objects){
    for (var key in objects[o]) result[key]=objects[o][key];
  }
  return result;
}

module.exports = router;

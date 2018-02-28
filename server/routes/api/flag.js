//This route is for flagging a specific record on the specified entity
//Requires "flag" permission on the specified entity
var MasterController = require("../../controllers/master"),
    entities = require("../entityConfig"),
    Flag = require("../../models/flag"),
    Error = require("../../controllers/error");

module.exports = {
  flag: function(req, res){
    var query = req.query || {};
    query["_id"] = req.params.id;
    var entity = req.params.entity;
    var user = req.user;
    var userPermissions = req.user.role.permissions[entity];

    if(req.body.flagType == "spam"){
      if(!user){
        res.json(Error.notLoggedIn());
      }
    }
    else{
      //check that the user has sufficient permissions for this operation
      if(!userPermissions || userPermissions.flag!=true){
        res.json(Error.insufficientPermissions());
      }
    }
    MasterController.get(req.query, query, entities[entity], function(response){    //This ensures that users can only update records they have access to
      if(response.data.length > 0){
        var flag = new Flag();
        flag.userid = user._id;
        flag.flagged = true;
        flag.flagType = req.body.flagType;
        flag.comment = req.body.comment;
        flag.entity = req.params.entity;
        flag.createdate_num = new Date(Date.now()).getTime();
        flag.entityId = req.params.id;
        flag.save(function(err){
          if(err){
            res.json(Error.custom(err));
          }
          else{
            res.json(flag);
          }
        });
      }
      else{
        res.json(Error.noRecord());
      }
    });
  },
  unflag: function(req, res){
    var query = req.query || {};
    query["entityId"] = req.params.id;
    var entity = req.params.entity;
    var user = req.user;
    var userPermissions = req.user.role.permissions[entity];
    //check that the user has sufficient permissions for this operation
    if(!userPermissions || userPermissions.flag!=true){
      res.json(Error.insufficientPermissions());
    }
    else{
      if(userPermissions.approve==false){
        query["userid"] = user._id;
      }
      Flag.update(query, {flagged: false, edituser: user._id}, function(err, result){
        if(err){
          console.error("flag.js - unflag - Flag.update")
          console.error(err);
        }
        else{
          res.json(result);
        }
      });
    }
  }
};

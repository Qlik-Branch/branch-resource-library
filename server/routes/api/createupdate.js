//These routes are for creating or updating records
var MasterController = require("../../controllers/master"),
    Error = require("../../controllers/error"),
    Notifier = require("../../controllers/notifier"),
    Mailer = require("../../controllers/emailer"),
    fs = require('fs'),
    envconfig = require("config"),
    entities = require("../entityConfig"),
    mongoose = require("mongoose"),
    marketo = require("../../marketo/marketo"),
    marked = require("marked-iframe"),
    epoch = require("milli-epoch"),
    s3 = require("../../s3/s3"),
    atob = require("atob");

module.exports = function(req, res){
  //This route is for creating a new record on the 'Project' entity and returning the new record
  //Requires "create" permission on the 'Project' entity
  //This has been separated due to the nature of creating a 'Project'
  var entity = req.params.entity;
  var user = req.user;
  var userPermissions = req.user.role.permissions[req.params.entity];
  var data = req.body;
  var query = req.query || {};
  var isNew = false;
  var imageEntities = [
    "project",
    "user"
  ];
  if(req.params.id){
    query["_id"] = req.params.id;
  }
  //else{
  if(userPermissions){
    var record = data.standard || data;
    if(!record._id && !req.params.id && !hasProps(req.query)){
      //this is a new item
      isNew = true;
      if(userPermissions.create!=true){
        res.json(Error.insufficientPermissions());
      }
      record._id = mongoose.Types.ObjectId();
      record.createuser = user._id;
      record.userid = data.special != null && data.special.author != null ? data.special.author : user._id;
      record.createdate = Date.now();
      record.createdate_num = new Date(Date.now()).getTime();
      record.last_updated = Date.now();
      record.last_updated_num = new Date(Date.now()).getTime();
    }
    else{
      if(userPermissions.update!=true){
        res.json(Error.insufficientPermissions());
      }
      else if (entity=="userprofile" && req.user.role.name!="admin") {
        //get the existing user
        entities["userprofile"].model.findOne({_id: record._id}).populate("role").exec( function(err, result){
          console.log(result.role._id);
          console.log(record.role._id);
          if(result && result.role._id != record.role._id){
            res.json(Error.insufficientPermissions());
            //this will crash node but in theory we should never make it here
          }
        });
      }
    }
    if(userPermissions.allOwners!=true && !isNew && req.params.entity != "userprofile"){
      query["userid"]=user._id;
    }
    record.edituser = user._id;
    record.editdate = Date.now();
    var imageBuffer;
    if(req.params.entity=="projects"){
      //record.last_git_check = Date.now();
      //build the similar projects query
      var similarQuery = {
        category: data.standard.category,
        $or: []
      };
      var tagList = data.standard.tags.split(",");
      for(var i=0;i<tagList.length;i++){
        similarQuery.$or.push({
          tags: {
            $regex: tagList[i].trim(),
            $options: "gi"
          }
        });
      }
    }

    if(data.special){
      Promise.all(
          [checkForMarkdown(data.special, record),
           checkForImage(data.special, record, req.params.entity),
           checkForThumbnail(data.special, record, req.params.entity)]
      ).then(() => {
        MasterController.save(query, record, entities[req.params.entity], function(newrecord){
          if(!newrecord.errCode){
            //send an notification to all subscribers of the item
            Notifier.sendUpdateNotification(newrecord._id, newrecord, req.params.entity);
          }
          checkForMarketo(entity, newrecord)
              .then(() => { res.json(newrecord) })
        });
      }).catch(error => {
        res.json(error)
      });
    }
    else{
      if(isNew && imageEntities.indexOf(req.params.entity)!=-1){
        record.image = "/attachments/default/"+req.params.entity+".png";
        record.thumbnail = "/attachments/default/"+req.params.entity+".png";
      }
      MasterController.save(query, record, entities[req.params.entity], function(newrecord){
        if(!newrecord.errCode){
          if(isNew){
            //most likely a comment but we'll check anyway
            if(req.params.entity=="comment"){
              MasterController.get({}, {_id: newrecord.entityId}, entities[newrecord.entity], function(parent){
                if(!parent.errCode){
                  if(parent.data && parent.data[0]){
                    if(parent.data[0].userid._id != newrecord.userid._id){
                      Mailer.sendMail('create', "comment", {parent: parent.data[0], comment: newrecord}, function(){
                        //Notifier.sendCommentNotification(parent.data[0]._id, {parent: parent.data[0], comment:newrecord});
                      });
                    }
                    Notifier.sendCommentNotification(parent.data[0]._id, {parent: parent.data[0], comment:newrecord});
                  }
                }
              });
            }
          }
          else{
            //send an notification to all subscribers of the item
            Notifier.sendUpdateNotification(newrecord._id, newrecord, req.params.entity);

          }
        }
        checkForMarketo(entity, newrecord)
            .then(() => { res.json(newrecord) })
      });
    }
  }
  else{
    res.json(Error.notLoggedIn());
  }
};

const checkForMarketo = (entity, record) => {
  return new Promise((resolve,reject) => {
    if(entity !== "userprofile") {
      resolve()
    } else {
      marketo.syncUser(record).then(() => { resolve() })
    }
  })
}

var checkForMarkdown = (special, record) => {
  return new Promise((resolve,reject) => {
    if(!special.markdown) {
      resolve();
    } else {
      var tokens = marked.lexer(record.content);
      var result = tokens.filter(function(token) { return /<[a-z][\s\S]*>/i.test(token.text) }).filter(function(token) { return token.type !== "code" })
      if(result.length > 0) {
        reject(Error.custom("HTML elements are not allowed outside of code context. If you are attempting to show code, please use backticks (`)."))
      } else {
        moveMarkdownImages(record.content, record._id)
        .then((content) => {
          record.content = content;
          resolve();
        });
      }
    }
  });
};

var moveMarkdownImages = (content, identifier, resolver) => {
  if (!resolver) {
    return new Promise((resolve) => {
      moveMarkdownImages(content, identifier, resolve);
    });
  } else {
    var linkStart = "//s3.amazonaws.com/" + envconfig.s3.bucket + "/attachments/tmp/";
    var markdown = content;
    var first = markdown.indexOf(linkStart);
    if (first < 0) {
      resolver(markdown);
    } else {
      var second = markdown.indexOf(")", first);
      first += linkStart.length - 16;
      var previousFile = markdown.substring(first, second);
      // the assumption here is that previous will be
      // attachments/tmp/<file>
      var newFile = previousFile.replace("/tmp/", "/" + identifier + "/");
      s3.moveFile(previousFile, newFile)
        .then(() => {
          markdown = markdown.substring(0,first) + newFile + markdown.substring(second);
          moveMarkdownImages(markdown, identifier, resolver);
        }).catch((err) => {
          console.log("Error moving image", err);
          resolver(markdown);
        });
    }
  }
};

var checkForImage = (special, record, entity) => {
  return new Promise((resolve) => {
    record.image = "/attachments/default/"+entity+".png";
    if(!special.image) {
      resolve()
    } else {
      console.log("Image Found for ", record._id.toString())
      var imageBuffer = new Buffer(special.image.data, 'base64');
      var imageKey = record._id.toString() + "/image.png";
      s3.uploadFile("attachments", imageKey, imageBuffer)
        .then((result) => {
          console.log("Successfully uploaded image", result.url)
          record.image = result.url;
          resolve();
        })
        .catch((err) => {
          console.log("Error uploading image", err);
          resolve();
        });
    }
  });
};

var checkForThumbnail = (special, record, entity) => {
  return new Promise((resolve) => {
    record.thumbnail = "/attachments/default/"+entity+".png";
    if(!special.thumbnail) {
      resolve()
    } else {
      var imageBuffer = new Buffer(special.thumbnail.data, 'base64');
      var thumbnailKey = record._id.toString() + "/thumbnail.png";
      s3.uploadFile("attachments", thumbnailKey, imageBuffer)
        .then((result) => {
          record.thumbnail = result.url;
          resolve();
        })
        .catch((err) => {
          console.log("Error uploading thumbnail", err);
          resolve();
        });
    }
  });
}

function hasProps(obj){
  for (var key in obj){
    if(obj.hasOwnProperty(key)){
      return true;  //the update query has a property
    }
  }
  return false;
}
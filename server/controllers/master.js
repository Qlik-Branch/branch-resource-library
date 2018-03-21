var Error = require('./error'),
    s3 = require("../s3/s3");;

module.exports = {
  get: function(query, parsedQuery, entity, callbackFn){
    entity.model.find(parsedQuery, entity.fields).populate(entity.populates).sort(entity.sort).skip(entity.skip).limit(entity.limit).exec(function(err, results){
      if(err){
        console.error("master.js - get - entity.model.find.exec")
        console.error(err);
        callbackFn.call(null, Error.errorGetting(err.message));
      }
      else{
        //establish how many rows are in the collection for the given query
        entity.model.count(parsedQuery, function(err, count){
          if(err){
            console.error("master.js - get - entity.model.count")
            console.error(err);
            callbackFn.call(null, Error.errorGetting(err.message));
          }
          else{
            var responseObj = {};
            var pageStart = 0;
            var pageNum = 1;
            responseObj.total = count;
            //responseObj.query = parsedQuery;
            responseObj.skip = parseInt(entity.skip) + parseInt(entity.limit);
            responseObj.limit = entity.limit;
            responseObj.data = results
            callbackFn.call(null, responseObj);
          }
        })
      }
    });
  },
  getIds: function(query, parsedQuery, entity, callbackFn){
    entity.model.find(parsedQuery).populate(entity.populates).sort(entity.sort).skip(entity.skip).limit(entity.limit).select("_id").exec(function(err, results){
      if(err){
        console.error("master.js - getIds - entity.model.find.select")
        console.error(err);
        callbackFn.call(null, Error.errorGetting(err.message));
      }
      else{
        //establish how many rows are in the collection for the given query
        entity.model.count(parsedQuery, function(err, count){
          if(err){
            console.error("master.js - getIds - entity.model.count")
            console.error(err);
            callbackFn.call(null, Error.errorGetting(err.message));
          }
          else{
            var responseObj = {};
            var pageStart = 0;
            var pageNum = 1;
            responseObj.total = count;
            if(entity.limit){
              responseObj.pages = [];
              while(pageStart < count){
                responseObj.pages.push({
                  pageNum: pageNum,
                  pageStart: pageStart,
                  pageEnd: Math.min(parseInt(pageStart)+parseInt(entity.limit), count)
                })
                pageNum++;
                pageStart+=parseInt(entity.limit);
              }
              responseObj.currentPage = (parseInt(entity.skip) / parseInt(entity.limit)) + 1 || 1;
            }
            responseObj.query = parsedQuery;
            responseObj.skip = parseInt(entity.skip) + parseInt(entity.limit);
            responseObj.limit = entity.limit;
            responseObj.data = results
            callbackFn.call(null, responseObj);
          }
        })
      }
    });
  },
  count: function(query, parsedQuery, entity, callbackFn){
    entity.model.count(parsedQuery, function(err, result){
      if(err){
        console.error("master.js - count - entity.model.count")
        console.error(err);
        callbackFn.call(null, Error.errorGetting(err.message));
      }
      else{
        callbackFn.call(null, {count:result});
      }
    });
  },
  getThumbnail: function(query, entity, callbackFn){
    entity.model.findOne(query, function(err, result){
      if(err){
        console.error("master.js - getThumbnail - entity.model.findOne")
        console.error(err);
        callbackFn.call(null, Error.errorGetting(err.message));
      }
      else{
        callbackFn.call(null, result);
      }
    });
  },
  save: function(query, data, entity, callbackFn){
    if(query && hasProps(query)){ //update
      if(query._id){
        entity.model.findOneAndUpdate(query, data, {new:true}).populate(entity.populates).exec(function(err, result){
          if(err){
            console.error("master.js - save - entity.model.findOneAndUpdate")
            console.error(err);
            callbackFn.call(null, Error.errorSaving(err.message));
          }
          else{
            callbackFn.call(null, result);
          }
        });
      }
      else{
        entity.model.update(query, data, {multi:true}).populate(entity.populates).exec(function(err, result){
          if(err){
            console.error("master.js - save - entity.model.update")
            console.error(err);
            callbackFn.call(null, Error.errorSaving(err.message));
          }
          else{
            callbackFn.call(null, result);
          }
        });
      }
    }
    else{ //new
      entity.model.create(data, function(err, result){
        if(err){
          console.error("master.js - save - entity.model.create")
          console.error(err);
          callbackFn.call(null, Error.errorSaving(err.errors.status));
        }
        else {
          entity.model.findOne({_id:result.id}).populate(entity.populates).exec(function(err, result){
            if(err){
              console.error("master.js - save - entity.model.findOne")
              console.error(err);
              callbackFn.call(null, Error.errorSaving(err.errors.status));
            }
            else{
              callbackFn.call(null, result);
            }
          });
        }
      });
    }
  },
  delete: function(query, entity, callbackFn){
    entity.model.remove(query, function(err, result){
      if(err){
        console.error("master.js - delete - entity.model.remove")
        console.error(err);
        callbackFn.call(null, Error.errorDeleting(err.message));
      }
      else{
        s3.deleteEntityFiles(query._id)
          .catch((err) => {
            console.error("master.js - delete - s3.deleteEntityFiles.catch")
            console.error(err);
          })
          .then(() => {
            // we're still sending back a null error below because even
            // though we had an issue removing attachments the entity
            // was properly removed.
            callbackFn.call(null, result);
          });
      }
    });
  }
};

function hasProps(obj){
  for (var key in obj){
    if(obj.hasOwnProperty(key)){
      return true;  //the update query has a property
    }
  }
  return false;
}

app.controller("moderationController", ["$scope", "$rootScope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "confirm", function($scope, $rootScope, $resource, $state, $stateParams, userManager, resultHandler, confirm, title){
  var Entity = $resource("/api/"+$scope.entity+"/:entityId/:function", {entityId: "@entityId", function: "@function"});
  var GitReadme = $resource("/git/updatereadme/:projectId", {projectId: "@projectId"});  //currently only applies to projects
  var Comment = $resource("api/comment/:commentId", {commentId: "@commentId"});

  $scope.userManager = userManager;
  $scope.isEditing = false;
  $scope.simplemde;

  $scope.isApproved = function(){
    return $scope.approved == "True" || $scope.approved == true;
  };

  $scope.flagEntity = function(flagType){
    confirm.prompt("Please provide a comment for this action.", {requireComment: true, options:["Ok", "Cancel"]}, function(response){
      var fn = $scope.flagged==true ? "unflag" : "flag";
      if(response.result==0){
        Entity.save({entityId: $scope.entityid, function: fn}, {comment: response.comment, flagType: flagType}, function(result){
          if(resultHandler.process(result)){
            $scope.flagged = !$scope.flagged;
          }
        });
      }
    });
  };

  $scope.hideEntity = function(){
    confirm.prompt("Please enter a reason for unapproving the item. An email will be sent to the owner so try not to be too harsh.", {requireComment: true, options:["Send", "Cancel"]}, function(response){
      if(response.result==0){
        Entity.save({entityId: $scope.entityid, function: "hide", hideComment: response.comment}, function(result){
          if(resultHandler.process(result)){
            $scope.approved = "False";
          }
        });
      }
    });
  };

  $scope.approveEntity = function(){
    Entity.save({entityId: $scope.entityid, function: "approve"}, function(result){
      if(resultHandler.process(result)){
        $scope.approved = "True";
        //need to remove all flags for the project here
      }
    });
  };

  $scope.editEntity = function(){
    if($scope.entity === "comment") {
      var textarea = $("<textarea></textarea>")
      textarea.text(GetEntityContent($scope.entityObject.content))
      $("#comment-" + $scope.entityid).empty().append(textarea)
      $scope.simplemde = new SimpleMDE({ element: textarea[0] })
      $scope.isEditing = true;
    } else {
      window.location = "#!"+($scope.entityuri||$scope.entity)+"/"+$scope.entityid+"/edit";
    }
  };

  $scope.saveEntity = function(){
    // right now saving on the fly like this is only for comments so the code
    // here is pretty specific to that. If we decide to extend this to other
    // entities we should take a look at changing the process.
    $scope.entityObject.content = $scope.simplemde.value();
    var data = {
      standard: {
        content: $scope.entityObject.content
      }
    };
    Comment.save({commentId: $scope.entityid }, data, function(result){
      $("#comment-" + $scope.entityid).empty().html(marked($scope.entityObject.content))
      $scope.isEditing = false;
    })
  };

  $scope.updateReadme = function(){
    GitReadme.get({projectId: $scope.entityid}, function(result){
      if(resultHandler.process(result)){
        window.location.reload();
      }
    })
  };

  $scope.deleteEntity = function(){
    confirm.prompt("Are you sure you want to delete the selected item?", {options:["Yes", "No"]}, function(response){
      if(response.result==0){
        Entity.delete({entityId: $scope.entityid}, function(result){
            if(resultHandler.process(result)){
              if($scope.entity!="comment"){
                window.location = "#!"+($scope.entityuri||$scope.entity);
              }
              $rootScope.$broadcast("listItemDeleted", $scope.entityid);
            }
        });
      }
    });
  };

  if(!userManager.hasUser()){
    userManager.refresh(function(hasUser){
      if(!hasUser){
        $scope.hasUser = false;
      }
      else{
        $scope.hasUser = true;
      }
    })
  }
  else{
    $scope.hasUser = true;
  }

  function GetEntityContent( content ) {
    if(content.data) {
      var buffer = content.data
      var binary = ''
      var bytes = new Uint8Array( buffer )
      var len = bytes.byteLength
      for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] )
      }
      return binary
    }
    return content
  }
}]);

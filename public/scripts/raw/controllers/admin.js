app.controller("adminController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "confirm", function ($scope, $resource, $state, $stateParams, userManager, resultHandler, confirm) {
  var User = $resource("api/userprofile/:userId", {userId: "@userId"});
  var Project = $resource("api/project/:projectId", {projectId: "@projectId"});
  var UserRoles = $resource("api/userrole/:roleId", {roleId: "@roleId"});
  var Feature = $resource("api/feature/:featureId", {featureId: "@featureId"});
  var Picklist = $resource("api/picklist/:picklistId", {picklistId: "@picklistId"});
  var PicklistItem = $resource("api/picklistitem/:picklistitemId", {picklistitemId: "@picklistitemId"});
  var Image = $resource("api/images/:imageName", {imageName: "@imageName"});
  var dropzone = null

  $scope.userManager = userManager;

  $scope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
    userManager.refresh(function (hasUser) {
      if (!hasUser) {
        window.location = "/";
      }
      else {
        if (userManager.userInfo.role.name != "admin") {
          window.location = "/";
        }
      }
    });
  });

  $scope.doingStuff = false;

  $scope.collections = [
    "user",
    "userprofile",
    "userrole",
    "feature",
    "project",
    "comment",
    "resource",
    "picklist",
    "picklistitem",
    "flag",
    "rating",
    "subscription"
  ];

  var defaultSelection;

  $scope.getImages = function () {
    Image.get({}, function (result) {
      if (resultHandler.process(result)) {
        $scope.images = result.data;
      }
    })
  }

  $scope.getImages()

  User.get({}, function (result) {
    if (resultHandler.process(result)) {
      $scope.users = result.data;
      $scope.userInfo = result;
      delete $scope.userInfo["data"];
    }
  });

  UserRoles.get({}, function (result) {
    if (resultHandler.process(result)) {
      $scope.roles = result.data;
      $scope.roleInfo = result;
      delete $scope.roleInfo["data"];
      $scope.setRole(0);
    }
  });

  Feature.get({}, function (result) {
    if (resultHandler.process(result)) {
      $scope.features = result.data;
      $scope.featureInfo = result;
      delete $scope.featureInfo["data"];
      $scope.setActiveFeature(0);
    }
  });

  Picklist.get({}, function (result) {
    if (resultHandler.process(result)) {
      $scope.picklists = result.data;
      $scope.picklistInfo = result;
      delete $scope.picklistInfo["data"];
      $scope.setActivePickList(0);
    }
  });

  $scope.activeRole = 0;

  $scope.activePicklist = 0;

  $scope.activeTab = 0;

  $scope.activeFeature = 0;

  $scope.setTab = function (index) {
    $scope.activeTab = index;
    searchExchange.clear(true);
    if (index === 4 && dropzone == null) {
      dropzone = new Dropzone('#adminImages', {
        previewTemplate: document.querySelector('#preview-template').innerHTML,
        addRemoveLinks: true,
        parallelUploads: 2,
        thumbnailHeight: 120,
        thumbnailWidth: 120,
        maxFilesize: 3,
        filesizeBase: 1000
      });
      dropzone.on('complete', function (file) {
        dropzone.removeAllFiles(true)
        $scope.getImages()
      })
    }
  };

  $scope.setRole = function (index) {
    $scope.activeRole = index;
    $scope.copyRoleName = $scope.roles[$scope.activeRole].name;
  };

  $scope.setActivePickList = function (index) {
    $scope.activePicklist = index;
    $scope.getPicklistItems($scope.picklists[index]._id);
    $scope.copyListName = $scope.picklists[$scope.activePicklist].name;
  };

  $scope.setActiveFeature = function (index) {
    $scope.activeFeature = index;
    Feature.get({_id: $scope.features[$scope.activeFeature]._id}, function (result) {
      if (resultHandler.process(result)) {
        if (result.data && result.data.length > 0) {
          $scope.currentFeature = result.data[0];
        }
      }
    });
  };

  $scope.saveRole = function () {
    UserRoles.save({roleId: $scope.roles[$scope.activeRole]._id}, $scope.roles[$scope.activeRole], function (result) {
      if (resultHandler.process(result, "Save")) {
        $scope.userManager.refresh();
      }
    });
  };

  $scope.savePicklist = function () {
    Picklists.save({picklistId: $scope.picklists[$scope.activePicklist]._id}, $scope.picklists[$scope.activePicklist], function (result) {
      if (resultHandler.process(result, "Save")) {

      }
    });
  };

  $scope.newRole = function (newrolename) {
    var that = this;
    UserRoles.save({}, {name: newrolename}, function (result) {
      if (resultHandler.process(result, "Create")) {
        $scope.roles.push(result);
        that.newrolename = "";
        $scope.setRole($scope.roles.length - 1);
      }
    });
  };

  $scope.newPicklist = function (newlistname) {
    var that = this;
    Picklist.save({}, {name: newlistname}, function (result) {
      if (resultHandler.process(result)) {
        $scope.picklists.push(result);
        that.newlistname = "";
        $scope.setActivePickList($scope.picklists.length - 1);
      }
    });
  };

  $scope.newPicklistItem = function (newlistitem) {
    var that = this;
    var item = {
      name: newlistitem,
      picklistId: $scope.picklists[$scope.activePicklist]._id,
      seq: $scope.picklistItems.length
    };
    that.newlistitem = "";
    $scope.savePicklistItem(item);
  };

  $scope.getPicklistItems = function (picklistId) {
    PicklistItem.get({picklistId: picklistId}, function (result) {
      if (resultHandler.process(result)) {
        $scope.picklistItems = result.data;
      }
    });
  };

  $scope.savePicklistItem = function (item) {
    PicklistItem.save({picklistitemId: item._id || ""}, item, function (result) {
      if (resultHandler.process(result)) {
        if ($scope.picklistItems) {
          $scope.picklistItems.push(result);
        }
        else {
          $scope.picklistItems = [result];
        }
      }
    });
  };

  $scope.copyRole = function (copyrolename) {
    var roleToCopy = $scope.roles[$scope.activeRole];
    if (copyrolename == roleToCopy.name) {
      copyrolename += " - copy";
    }
    UserRoles.save({}, {name: copyrolename, permissions: roleToCopy.permissions}, function (result) {
      if (resultHandler.process(result)) {
        $scope.roles.push(result);
        $scope.setRole($scope.roles.length - 1);
      }
    });
  };

  $scope.$on('setFeature', function (event, args) {
    $scope.setFeature(args[0]);
  });

  searchExchange.subscribe('setFeature', 'adminConsole', function (handles, data) {
    //in this instance we're hijacking the handle paramter and using it to establish the entity
    $scope.setFeature(handles, data);
  });

  $scope.changeFeatureImage = function () {
    confirm.prompt("Would you like to upload an image or enter a url to link to?", {options: ["Upload", "Link", "Cancel"]}, function (response) {
      if (response.result == 0) {
        //upload
      }
      else if (response.result == 1) {
        //link
        confirm.prompt("Please enter a link to an image", {
          requireComment: true,
          options: ["Ok", "Cancel"]
        }, function (response) {
          if (response.result == 0) {
            $scope.currentFeature.image = response.comment;
            $scope.saveFeature();
          }
        });
      }
    });
  };

  $scope.setFeature = function (entity, data) {
    if(entity === "project") {
      $scope.getProject(data, function (result) {
        $scope.currentFeature.entityId = result._id;
        $scope.currentFeature.title = result.title;
        $scope.currentFeature.comment = result.short_description;
        $scope.currentFeature.image = result.image == null ? result.thumbnail : result.image;
        $scope.currentFeature.userid = result.userid._id;
        Feature.save({featureId: $scope.currentFeature._id}, $scope.currentFeature, function (result) {
          if (resultHandler.process(result)) {
            $scope.setActiveFeature($scope.activeFeature);
          }
        });
      });
    } else {
      $scope.currentFeature.entityId = null
      $scope.currentFeature.title = data[0]
      $scope.currentFeature.comment = data[1]
      $scope.currentFeature.image = data[2]
      $scope.currentFeature.link = data[3]
      $scope.currentFeature.userid = null
      Feature.save({featureId: $scope.currentFeature._id}, $scope.currentFeature, function (result) {
        if (resultHandler.process(result)) {
          $scope.setActiveFeature($scope.activeFeature);
        }
      });
    }
  };

  $scope.getProject = function (id, callbackFn) {
      Project.get({projectId: id}, function (result) {
        if (resultHandler.process(result)) {
          if (result.data && result.data[0]) {
            callbackFn.call(null, result.data[0]);
          }
          else {
            callbackFn.call(null, null);
          }
        }
        else {
          callbackFn.call(null, null);
        }
      });
  };

  $scope.saveFeature = function () {
    Feature.save({featureId: $scope.features[$scope.activeFeature]._id}, $scope.currentFeature, $scope.features[$scope.activeFeature], function (result) {
      if (resultHandler.process(result)) {
        $scope.setActiveFeature($scope.activeFeature);
      }
    });
  };

  $scope.exportUsers = function() {
    if(window.confirm("Are you sure you want to export all users? This action is very intensive on the database and should be done sparingly"))
      window.location ="/api/export"
  }

  $scope.highlightRow = function (id) {
    if ($scope.features[$scope.activeFeature].entityId == id) {
      return true;
    }
    return false;
  };

  $scope.copyUrl = function (url) {
    window.prompt("Copy the URL below", url);
  }

  $scope.removeImage = function (key) {
    Image.delete({imageName: key}, function (err) {
      console.log(err)
      $scope.getImages()
    })
  }

  $scope.deletePicklistItem = function (id) {
    $scope.doingStuff = true;
    PicklistItem.delete({picklistitemId: id}, function (result) {
      $scope.doingStuff = false;
      if (resultHandler.process(result)) {
        $scope.setActivePickList($scope.activePicklist);
      }
    });
  };

  $scope.movePicklistItem = function (index, direction) {
    var stepA = $scope.picklistItems[index];
    var stepB = $scope.picklistItems[index + direction];
    originalA = stepA.seq || index;
    originalB = stepA.seq || (index + direction);
    if (!stepA.seq) {
      stepA.seq = originalA;
    }
    if (!stepB.seq) {
      stepB.seq = originalB;
    }
    stepA.seq += direction;
    stepB.seq -= direction;
    PicklistItem.save({picklistitemId: stepA._id}, stepA, function (result) {
      if (resultHandler.process(result)) {
        PicklistItem.save({picklistitemId: stepB._id}, stepB, function (result) {
          if (resultHandler.process(result)) {
            $scope.picklistItems.splice(originalA, 1);
            $scope.picklistItems.splice(originalA += direction, 0, stepA);
          }
        });
      }
    });
  };

  $scope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
    if (toState.name != "loginsignup") {
      searchExchange.view = toState.name.split(".")[0];
    }
    $scope.setTab(0);
  });
}]);

app.controller("projectController", ["$scope", "$resource", "$state", "$stateParams", "$anchorScroll", "userManager", "resultHandler", function($scope, $resource, $state, $stateParams, $anchorScroll, userManager, resultHandler){
  var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
  var Category = $resource("api/projectcategories/:projectCategoryId", {projectCategoryId: "@projectCategoryId"});
  var Product = $resource("api/products/:productId", {productId: "@productId"});

  if(userManager.user){
    $scope.permissions = userManager.user.role.permissions;
  }
  $scope.projects = [];
  $scope.url = "projects";

  $scope.stars = new Array(5);

  console.log('params - ',$stateParams);

  $scope.sortOptions = {
    createdate: {
      id: "createdate",
      name: "Last Updated",
      order: -1,
      field: "createdate"
    },
    rating:{
      id: "rating",
      name: "Highest Rated",
      order: [-1,-1],
      field:["votenum", "votetotal"]
    },
    lastpost: {
      id: "lastpost",
      name: "Most recent comments",
      order: -1,
      field: "lastpost"
    },
    title: {
      id: "title",
      name: "A-Z",
      order: 1,
      field: "title"
    }
  };

  $scope.sort = $scope.sortOptions.createdate;
  $scope.categoryId = "";
  $scope.productId = "";

  $scope.query = {

  };
  if($stateParams.sort && $scope.sortOptions[$stateParams.sort]){
    $scope.sort = $scope.sortOptions[$stateParams.sort];
  }
  $scope.query.sort = $scope.sort.field;
  $scope.query.sortOrder = $scope.sort.order;
  if($stateParams.projectId){
    $scope.query.projectId = $stateParams.projectId;
  }
  if($stateParams.product){
    $scope.productId = $stateParams.product;
    $scope.query.product = $stateParams.product;
  }
  if($stateParams.category){
    $scope.categoryId = $stateParams.category;
    $scope.query.forumid = $stateParams.category;
  }

  Category.get({}, function(result){
    if(resultHandler.process(result)){
      $scope.projectCategories = result.data;
      $scope.projectCategoryInfo = result;
      delete $scope.projectCategoryInfo["data"];
    }
  });

  Product.get({}, function(result){
    if(resultHandler.process(result)){
      $scope.projectProducts = result.data;
      $scope.projectProductInfo = result;
      delete $scope.projectProductInfo["data"];
    }
  });

  $scope.getProjectData = function(query, append){
    Project.get(query, function(result){
      if(resultHandler.process(result)){
        if(append && append==true){
          $scope.projects = $scope.projects.concat(result.data);
        }
        else{
          $scope.projects = result.data;
        }
        $scope.projectInfo = result;
        delete $scope.projectInfo["data"];
        console.log($scope.projectInfo);
      }
    });
  };

  $scope.getMore = function(){
    var query = $scope.projectInfo.query;
    query.limit = $scope.projectInfo.limit;
    query.skip = $scope.projectInfo.skip;
    query.sort = $scope.sort.field;
    query.sortOrder = $scope.sort.order;
    $scope.getProjectData(query, true);
  };

  $scope.getRating = function(total, count){
    if(count && count > 0){
      return Math.round(parseInt(total) / parseInt(count));
    }
    else{
      return 0;
    }
  }

  $scope.getBuffer = function(binary){
    return _arrayBufferToBase64(binary);
  };

  function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return binary ;
  }

  $scope.getPageText = function(){
    if($scope.projects[0] && $scope.projects[0].content){
      return marked($scope.projects[0].content);
    }
  };

  $scope.applySort = function(){
    window.location = "#projects?sort=" + $scope.sort.id + "product=" + $scope.productId + "&category=" + $scope.categoryId;
  };

  $scope.getProjectData($scope.query); //get initial data set
}]);

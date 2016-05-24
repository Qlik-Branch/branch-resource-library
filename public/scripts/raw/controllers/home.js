app.controller("homeController", ["$rootScope","$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", function($rootScope, $scope, $resource, $state, $stateParams, userManager, resultHandler){
  var Feature = $resource("api/feature/:featureId", {featureId: "@featureId"});
  var Project = $resource("api/project/:projectId", {projectId: "@projectId"});
  var Article = $resource("api/blog/:blogId", {blogId: "@blogId"});

  $scope.featuredProject = {};
  $scope.featuredArticle = {};
  
  $rootScope.headTitle = "Welcome to Qlik Branch";
  $rootScope.metaKeys = "Branch, Qlik Branch, Qlik Sense, Qlik, Data Analytics, Data Visualization, QlikView, Developers, APIs, Github, Open Source, Developer Relations, Innovation";
  $rootScope.metaDesc = "Qlik Branch is a game-changing platform for web developers using Qlik's APIs to accelerate innovation in bringing the best ideas to market. Rooted in open source philosophy, all projects are freely distributed and modified, allowing faster collaboration and innovation."
  Feature.get({}, function(result){
    if(resultHandler.process(result)){
      $scope.features = result.data;
      $scope.featureInfo = result;
      delete $scope.featureInfo["data"];

      //get the featured content
      for(var f in $scope.features){
        var entityId = $scope.features[f].entityId;
        switch ($scope.features[f].name){
          case "project":
            $scope.featuredProject = $scope.features[f];
            break;
          case "article":
            $scope.featuredArticle = $scope.features[f];
            break;
        }
      }
    }
  });

  //Get the latest 5 projects
  Project.get({sort: 'createdate_num', sortOrder:'-1', limit:'3'}, function(result){
    if(resultHandler.process(result)){
      $scope.latestProjects = result.data;
    }
  });

  Article.get({sort: 'createdate_num', sortOrder:'-1', limit:'3'}, function(result){
    if(resultHandler.process(result)){
      $scope.latestArticles = result.data;
    }
  });

}]);

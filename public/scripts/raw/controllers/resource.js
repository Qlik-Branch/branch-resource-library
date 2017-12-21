app.controller("resourceController", ["$sce","$rootScope","$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "notifications", "picklistService", function($sce,$rootScope, $scope, $resource, $state, $stateParams, userManager, resultHandler, notifications, picklistService){
  var Resource = $resource("api/resource/:resourceId", {resourceId: "@resourceId"});
  var Image = $resource("api/resource/image/:url", {url: "@url"});

  $scope.pageSize = 20;
  $scope.query = {};
  $scope.simplemde;

  $scope.resourceLoading = $stateParams.resourceId!="new";
  $scope.isNew = $stateParams.resourceId=="new";
  $scope.resourceTypes;
  $rootScope.headTitle = "Resource Center: Qlik Branch";
  $rootScope.metaKeys = "Branch, Qlik Branch, Resource Center, Tutorials, Tips, Learning, Getting Started, Knowledge Base, Qlik, Open Source";
  $rootScope.metaDesc = "The Qlik Branch Resource Center is a repository for knowledge created and shared by the Qlik web developer community.  It holds content such as tutorials, tips, tricks, snippets, videos, and anything else that could be helpful in developing with the Qlik platform."
  $rootScope.metaImage = "http://branch.qlik.com/resources/branch_logo.png";


  picklistService.getPicklistItems("Resource Type", function(items){
    $scope.resourceTypes = items;
    $scope.newresourceType = items[0];
  });

  if($stateParams.resourceId){
    $scope.query.resourceId = $stateParams.resourceId;
    $scope.resourceId = $stateParams.resourceId;
  }

  $scope.getResourceData = function(query, append){
    Resource.get(query, function(result){
      $scope.resourceLoading = false;
      if(resultHandler.process(result)){
        if(result.data && result.data.length > 0){
          if($stateParams.status){
            if($stateParams.status=='created'){
              notifications.notify("Your resource has been successfully submitted for approval.", null, {sentiment:"positive"});
            }
            else if ($stateParams.status=='updated') {
              notifications.notify("Your resource has been successfully updated. It may take up to 5 minutes for the listing page to reflect these changes.", null, {sentiment:"positive"});
            }
          }
          if(append && append==true){
            $scope.resources = $scope.resources.concat(result.data);
          }
          else{
            $scope.resources = result.data;
            //if this is the detail view we'll update the breadcrumbs
          }
          if($state.current.name=="rc.addedit"){
            $scope.simplemde.value(_arrayBufferToBase64(result.data[0].content.data));
          }
          $scope.resourceInfo = result;
          /*console.log(result.data[0]);
          $rootScope.headTitle = "Resource Center: Qlik Branch";
          $rootScope.metaKeys = "Branch, Qlik Branch, Resource Center, Tutorials, Tips, Learning, Getting Started, Knowledge Base, Qlik, Open Source";
          $rootScope.metaDesc = "The Qlik Branch Resource Center is a repository for knowledge created and shared by the Qlik web developer community.  It holds content such as tutorials, tips, tricks, snippets, videos, and anything else that could be helpful in developing with the Qlik platform."
          */
          delete $scope.resourceInfo["data"];
        }
        else{
          window.location = "#!noitem";
        }
      }
    });
  };

  $scope.validateNewResourceData = function(){
    //We're validating client side so that we don't keep passing image data back and forth
    //Some of these errors shouldnt occur becuase of the html5 'required' attribute but just in case...
    var errors = [];
    //Verify the resource has a name
    if(!$scope.resources[0].title || $scope.resources[0].title==""){
      errors.push("Please specify a title");
    }
    //Verify the resource has a type
    if(!$scope.resources[0].resourceType){
      errors.push("Please select a Type");
    }
    //Verify the resource has content
    if($scope.simplemde.value().length==0 || $scope.simplemde.value().length==12){  //this is not necessarily robust. a length of 12 appears to be an empty input
      errors.push("Please add some content");
    }
    var tokens = marked.lexer($scope.simplemde.value());
    var result = tokens.filter(function(token) { return /<[a-z][\s\S]*>/i.test(token.text) }).filter(function(token) { return token.type !== "code" })
    if(result.length > 0) {
      errors.push("HTML elements are not allowed outside of code context. If you are attempting to show code, please use backticks (`).")
    }
    //If there are errors we need to notify the user
    if(errors.length > 0){
      //show the errors
      notifications.notify("The resource post could not be saved. Please review the following...", errors, {sentiment: "warning"});
      window.scrollTo(100,0);
    }
    else{
      //Save the record
      $scope.saveResource();
    }
  };

  $scope.saveResource = function(){
    $scope.resourceLoading = true;
    $scope.resources[0].content = $scope.simplemde.value();
    $scope.resources[0].plaintext = cleanUpContent($scope.resources[0].content);
    var data = {
      standard: $scope.resources[0],
      special: {
        markdown: true
      }
    };
    var query = {};
    if($scope.resources[0]._id){
      query.resourceId = $scope.resources[0]._id;
    }
    Resource.save(query, data, function(result){
      $scope.resourceLoading = false;
      if(resultHandler.process(result)){
        var status = $scope.isNew ? "created" : "updated";
        window.location = "#!resource/"+result._id+"?status="+status;
      }
      else{
        notifications.notify(result.errText, null, {sentiment: "negative"});
      }
    });
  };

  $scope.getResourceContent = function(text){
    if(text && text.data){
      var buffer = _arrayBufferToBase64(text.data);
      var result = marked(buffer);
      return $sce.trustAsHtml(result);
    }
    else{
      return "";
    }
  };

  $scope.addImageToMarkdown = function(url) {
    var imageContent = "![](" + url + ")";
    $scope.simplemde.codemirror.replaceSelection(imageContent);
  };

  $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams){
    if(fromState.name.split(".")[0]==toState.name.split(".")[0]){ //then we should clear the search state
       if(toState.name.split(".").length==1){ //we only need to do this if we're on a listing page
        searchExchange.publish("executeSearch");
       }
    }
    if(toState.name!="loginsignup"){
      searchExchange.view = toState.name.split(".")[0];
    }
    if((fromState.name.split(".")[0]!=toState.name.split(".")[0]) || fromState.name=="loginsignup"){
      searchExchange.clear(true);
    }
    defaultSelection = [];
    if($state.current.name=="rc.detail"){
      $scope.getResourceData($scope.query); //get initial data set
      userManager.refresh(function(hasUser){
        $scope.currentuserid = userManager.userInfo._id;
      });
    }
    else if($state.current.name=="rc.addedit"){
      $scope.simplemde = new SimpleMDE({ element: $("#resourceContent")[0],
                                         placeholder: "Resource content uses markdown. If you would like to add an image to your markdown you can upload the image below, then click the image to add." });

      var dropzone = new Dropzone('#resourceImages', {
        previewTemplate: document.querySelector('#preview-template').innerHTML,
        addRemoveLinks: true,
        parallelUploads: 2,
        thumbnailHeight: 120,
        thumbnailWidth: 120,
        maxFilesize: 3,
        filesizeBase: 1000
      });

      dropzone.on("success", function(file, response) {
        file.url = response.url;
        file.previewElement.addEventListener("click", function() {
          $scope.addImageToMarkdown(response.url);
        })
      });

      dropzone.on("removedfile", function(file) {
        Image.delete({url: file.url}, function(response) {
          console.log("Removed", file.url);
        });
      });

      picklistService.getPicklistItems("Resource Type", function(items){
        $scope.resourceTypes = items;
      });
      if($stateParams.resourceId=="new"){
        $scope.resources = [{}];
      }
      var hasUser = userManager.hasUser();
      if(!hasUser){
        userManager.refresh(function(hasUser){
          if(!hasUser){
            window.location = "#!login?url=resource/"+$stateParams.resourceId+"/edit"
          }
          else{
            if($stateParams.resourceId!="new"){
              $scope.getResourceData($scope.query); //get initial data set
            }
          }
        });
      }
      else{
        if($stateParams.resourceId!="new"){
          $scope.getResourceData($scope.query); //get initial data set
        }
      }
    }
    else{ //this should be the list page
      if(!userManager.hasUser()){
        userManager.refresh(function(hasUser){
          if(!hasUser){
            defaultSelection = [{
              field: "approved",
              values: [{qText: "True"}]
            }]
          }
          else{
            if(!userManager.canApprove('resource')){
              defaultSelection = [{
                field: "approved",
                values: [{qText: "True"}]
              }]
            }
          }
          searchExchange.subscribe('reset', "resources", function(){
            searchExchange.init(defaultSelection);
            searchExchange.unsubscribe('reset', "resources");
          });
          if((fromState.name.split(".")[0]!=toState.name.split(".")[0]) || fromState.name=="loginsignup"){
            searchExchange.clear(true);
          }
        });
      }
      else{
        if(!userManager.canApprove('resource')){
          defaultSelection = [{
            field: "approved",
            values: [{qText: "True"}]
          }]
        }
        searchExchange.subscribe('reset', "resources", function(){
          searchExchange.init(defaultSelection);
          searchExchange.unsubscribe('reset', "resources");
        });
        if((fromState.name.split(".")[0]!=toState.name.split(".")[0]) || fromState.name=="loginsignup"){
          searchExchange.clear(true);
        }
      }
    }
  });

  function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return binary ;
  }

  function cleanUpContent(text){
    var noImg = text.replace(/<img[^>]*>/g,"[image]");
    noHTML = noImg.replace(/<\/?[^>]+(>|$)/g, "");
    return noHTML;
  }

}]);

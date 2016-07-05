app.controller("authController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "notifications", "lastError", function($scope, $resource, $state, $stateParams, userManager, resultHandler, notifications, lastError){
  var Login = $resource("auth/login");
  var Signup = $resource("auth/signup");
  var Reset = $resource("auth/reset");
  var Captcha = $resource("visualcaptcha/try");

  $scope.authLoading = false;
  $scope.resetting = false;

  $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams){
    lastError.checkForErrors(function(error){
      if(error.errCode){
        notifications.notify(error.errText, [], {sentiment: "warning"});
      }
    });
  });

  if($stateParams.url){
    $scope.returnUrl = $stateParams.url.replace(/%2F/gi, '');
  }

  $scope.captchaOptions = {
                imgPath: 'bower_components/visualcaptcha.angular/img/',
                captcha: {
                    numberOfImages: 4,
                    url: "/visualcaptcha",
                    supportsAudio: false
                },
                init: function ( captcha ) {
                    $scope.captcha = captcha;
                }
            };

  $scope.login = function(){
    $scope.authLoading = true;
    Login.save({
      username: $scope.loginusername,
      password: $scope.loginpassword
    }, function(result){
      if(resultHandler.process(result)){
        userManager.refresh();
        searchExchange.clear(true);
        var pattern = /^https?:\/\//i;
        if (pattern.test($scope.returnUrl))
        {
          window.location = $scope.returnUrl;
        } else {
          window.location = "#!" + $scope.returnUrl || "/";
        }

      }
      else{
        $scope.authLoading = false;
        notifications.notify(result.errText, null, {sentiment: 'negative'});
      }
    });
  };

  $scope.signup = function(){
    //check the captcha form has been filled
    if ($scope.isVisualCaptchaFilled()){
      //check that the captcha selection is correct
      var captchaField = $(".imageField")[0];
      var captchaCheck = {};
      captchaCheck[$(captchaField).attr('name')] = $(captchaField).attr('value');
      $scope.authLoading = true;
      Captcha.save(captchaCheck, function(result){
        if(result.status=="valid"){
          Signup.save({
            username: $scope.username,
            password: $scope.password,
            email: $scope.email
          }, function(result) {
            if(resultHandler.process(result)){
              userManager.refresh();
              var pattern = /^https?:\/\//i;
              if (pattern.test($scope.returnUrl))
              {
                window.location = $scope.returnUrl;
              }
              else{
                window.location = "#!" + $scope.returnUrl || "/";  
              }
            }
            else{
              $scope.authLoading = false;
              notifications.notify(result.errText, null, {sentiment: 'negative'});
            }
          });
        }
        else{
          $scope.authLoading = false;
          notifications.notify("Specified captcha is not correct", null, {sentiment: 'negative'});
        }
      });
    }
  };

  $scope.reset = function() {
    $scope.resetting = true;
    Reset.save({
      email: $scope.email
    }, function(result) {
      if(resultHandler.process(result)){
        $scope.resetting = false;
        userManager.refresh();
        $scope.email = "";
        notifications.notify("An email has been sent to the specified address.", null, {sentiment: 'positive'});
      }
      else{
        $scope.resetting = false;
        notifications.notify(result.errText, null, {sentiment: 'negative'});
      }
    })
  };

  $scope.isVisualCaptchaFilled = function() {
      if ( !$scope.captcha.getCaptchaData().valid ) {
          notifications.notify("visualCaptcha is NOT filled", null, {sentiment: 'warning'});
          return false;
      }
      return true;
  };

}]);

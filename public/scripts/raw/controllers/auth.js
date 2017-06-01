app.controller("authController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "notifications", "lastError", function ($scope, $resource, $state, $stateParams, userManager, resultHandler, notifications, lastError, vcRecaptchaService) {
  var Login = $resource("auth/login");
  var Signup = $resource("auth/signup");
  var Check = $resource("auth/check")
  var Reset = $resource("auth/reset");
  var Recaptcha = $resource("recaptcha")

  $scope.authLoading = false;
  $scope.resetting = false;

  $scope.response = null;
  $scope.widgetId = null;
  $scope.model = {
    key: 'invalid key'
  };
  Recaptcha.get({}, function (result) {
    $scope.model = result
  })

  $scope.setResponse = function (response) {
    $scope.response = response;
  };
  $scope.setWidgetId = function (widgetId) {
    $scope.widgetId = widgetId;
  };
  $scope.cbExpiration = function () {
    vcRecaptchaService.reload($scope.widgetId);
    $scope.response = null;
  };

  $scope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
    lastError.checkForErrors(function (error) {
      if (error.errCode) {
        notifications.notify(error.errText, [], {sentiment: "warning"});
      }
    });
  });

  if ($stateParams.url) {
    $scope.returnUrl = $stateParams.url.replace(/%2F/gi, '');
  }

  $scope.login = function () {
    $scope.authLoading = true;
    Login.save({
      username: $scope.loginusername,
      password: $scope.loginpassword
    }, function (result) {
      if (resultHandler.process(result)) {
        userManager.refresh();
        searchExchange.clear(true);
        var pattern = /^https?:\/\//i;
        if (pattern.test($scope.returnUrl)) {
          window.location = $scope.returnUrl;
        } else {
          window.location = "#!" + $scope.returnUrl || "/";
        }

      }
      else {
        $scope.authLoading = false;
        notifications.notify(result.errText, null, {sentiment: 'negative'});
      }
    });
  };

  $scope.signup = function () {
    if ($scope.unsubscribed == null) {
      notifications.notify("Please answer the scary marketing question", null, {sentiment: 'negative'})
      return
    }
    Check.get({username: $scope.username, email: $scope.email }, function(result) {
      if(!result.found) {
        Recaptcha.save({response: $scope.response}, function (result) {
          if (result.success) {
            Signup.save({
              username: $scope.username,
              password: $scope.password,
              email: $scope.email,
              company: $scope.company,
              country: $scope.country,
              fullname: $scope.fullname,
              unsubscribed: $scope.unsubscribed
            }, function (result) {
              if (resultHandler.process(result)) {
                userManager.refresh();
                var pattern = /^https?:\/\//i;
                if (pattern.test($scope.returnUrl)) {
                  window.location = $scope.returnUrl;
                }
                else {
                  window.location = "#!" + $scope.returnUrl || "/";
                }
              }
              else {
                $scope.authLoading = false;
                notifications.notify(result.errText, null, {sentiment: 'negative'});
              }
            });
          } else {
            notifications.notify("Please make sure you have clicked on the captcha", null, {sentiment: 'negative'});
          }
        }, function (error) {
          notifications.notify("There was an issue validating the captcha", null, {sentiment: 'negative'});
        })
      } else {
        notifications.notify(result.message, null, {sentiment: 'negative'});
      }
    })
  };

  $scope.reset = function () {
    $scope.resetting = true;
    Reset.save({
      email: $scope.email
    }, function (result) {
      if (resultHandler.process(result)) {
        $scope.resetting = false;
        userManager.refresh();
        $scope.email = "";
        notifications.notify("An email has been sent to the specified address.", null, {sentiment: 'positive'});
      }
      else {
        $scope.resetting = false;
        notifications.notify(result.errText, null, {sentiment: 'negative'});
      }
    })
  };

}]);

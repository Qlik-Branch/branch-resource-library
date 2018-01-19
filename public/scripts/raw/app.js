//(function() {
  var markedRenderer = new marked.Renderer()

  markedRenderer.image = function(src, title, alt) {
    var renderedImage = "<img src=\"" + src + "\""
    if (alt != null && alt != "") {
      renderedImage += " alt=\"" + alt + "\""
    }
    if (title != null && title != "") {
      if (title.indexOf("x") >= 0) {
        var sizes = title.split("x")
        if(sizes.length == 2 && !isNaN(sizes[0]) && !isNaN(sizes[1])) {
          renderedImage += " width=\"" + sizes[0] + "\" height=\"" + sizes[1] + "\""
        }
      } else if (!isNaN(title)) {
        renderedImage += " width=\"" + title + "\""
      }
    }
    renderedImage += " />"
    return renderedImage
  }

  markedRenderer.iframe = function(src) {
    return "<div class=\"markdown-iframe\"><iframe frameborder=\"0\" allowfullscreen src=\"" + src + "\"></iframe></div>";
  }

  marked.setOptions({ renderer: markedRenderer, sanitize: true })

  var app = angular.module("branch", ["ui.router", "ngResource", "ngConfirm", "ngNotifications", "ngComments", "ngModeration", "ngRating", "ngSubscribe", "ngSanitize", "vcRecaptcha" ]);

  app.config(["$stateProvider","$urlRouterProvider", "confirmConfigProvider", "notificationConfigProvider", "commentsConfigProvider", "moderationConfigProvider", "ratingConfigProvider", "subscribeConfigProvider", "$locationProvider", function($stateProvider, $urlRouterProvider, confirmConfigProvider, notificationConfigProvider, commentsConfigProvider, moderationConfigProvider, ratingConfigProvider, subscribeConfigProvider, $locationProvider) {
    $urlRouterProvider.otherwise(function($injector,$location) {
      // if the url starts with "#%2F" it means that the url that
      // was attempted was actually a "/#/" link (ie. /#/project). Since we converted
      // from # to #! after releasing, we need to handle these links
      // properly. Turns out $location.$$hash has that value we need
      if ($location.$$url.substr(0,4) === "#%2F") {
        return $location.$$hash;
      }
      return "/";
    });

    $stateProvider
    //home page
    .state("home", {
      url: "/",
      templateUrl: "/views/home/index.html",
      controller: "homeController"
    })
    //Terms & Conditions
    .state("tnc", {
      url: "/tnc",
      templateUrl: "/views/tnc/index.html"
    })
    //no item page
    .state("noitem", {
      url: "/noitem",
      templateUrl: "/views/noitem.html"
    })
    //no item page
    .state("badbrowser", {
      url: "/badbrowser",
      templateUrl: "/views/badbrowser.html"
    })
    //login and signup page
    .state("loginsignup", {
      url: "/loginsignup?url",
      templateUrl : "/views/loginsignup.html",
      controller: "authController"
    })
    //login page
    //used if a session has expired or user is not logged in and tries to navigate to a page that requires authentication
    .state("login", {
      url: "/login?url",
      templateUrl : "/views/login.html",
      controller: "authController"
    })
    //password reset page
    //used if a session has expired or user is not logged in and tries to navigate to a page that requires authentication
    .state("reset", {
      url: "/reset",
      templateUrl : "/views/reset/reset.html",
      controller: "authController"
    })
    .state("reset.changepassword", {
      url: "/:hash",
      views:{
        "@":{
          templateUrl: "/views/reset/change-password.html",
          controller: "authController",
        }
      }
    })
    //used to navigate to the admin console
    .state("admin", {
      url: "/shouldntbeabletoguessthisurl",
      templateUrl: "/views/admin/index.html",
      controller: "adminController"
    })
    //used to navigate to the moderator console
    .state("moderator", {
      url: "/moderator",
      templateUrl: "/views/moderator/index.html",
      controller: "moderatorController"
    })
    //used to navigate to the project list page
    .state("projects", {
      url: "/project?terms&page&sort",
      templateUrl: "/views/projects/index.html",
      controller: "projectController"
    })
    //used to navigate to a given project detail page
    .state("projects.detail", {
      url: "/:projectId?status",
      views:{
        "@":{
          templateUrl: "/views/projects/detail.html",
          controller: "projectController",
        }
      }
    })
    //used to navigate to a given project detail page
    .state("projects.addedit", {
      url: "/:projectId/edit",
      views:{
        "@":{
          templateUrl: "/views/projects/addedit.html",
          controller: "projectController",
        }
      }
    })
    //used to navigate to the publication list page
    .state("publications", {
      url: "/blog",
      templateUrl: "/views/publications/index.html",
      controller: "publicationController"
    })
    .state("publications.redirect", {
      url: "/:publicationId?status",
      views:{
        "@":{
          templateUrl: "/views/publications/index.html",
          controller: "publicationController"
        }
      }
    })
    //used to navigate to the rc list page
    .state("rc", {
      url: "/knowledge",
      templateUrl: "/views/resourcecenter/index.html",
      controller: "resourceController"
    })
    //used to navigate to a given knowledge hub detail page
    .state("rc.detail", {
      url: "/:resourceId?status",
      views:{
        "@":{
          templateUrl: "/views/resourcecenter/detail.html",
          controller: "resourceController",
        }
      }
    })
    //used to navigate to the knowledge hub add/edit page
    .state("rc.addedit", {
      url: "/:resourceId/edit",
      views:{
        "@":{
          templateUrl: "/views/resourcecenter/addedit.html",
          controller: "resourceController",
        }
      }
    })
    //used to navigate to a user list page (not currently used)
    .state("users", {
      url: "/user?sort",
      templateUrl: "/views/users/index.html",
      controller: "userController"
    })
    //used to allow users to change their password
    .state("users.changepassword", {
      url: "/changepassword",
      views:{
        "@":{
          templateUrl: "/views/users/changepassword.html",
          controller: "userController",
        }
      }
    })
    //used to navigate to a given user detail page
    .state("users.detail", {
      url: "/:userId",
      views:{
        "@":{
          templateUrl: "/views/users/detail.html",
          controller: "userController",
        }
      }
    })
    //used to navigate to a given user add/edit page
    .state("users.addedit", {
      url: "/:userId/edit",
      views:{
        "@":{
          templateUrl: "/views/users/addedit.html",
          controller: "userController",
        }
      }
    })
    //used to navigate to a user list page (not currently used)
    .state("userprofiles", {
      url: "/userprofile?sort",
      templateUrl: "/views/users/index.html",
      controller: "userController"
    })
    //used to navigate to a given user add/edit page
    .state("userprofiles.addedit", {
      url: "/:userId/edit",
      views:{
        "@":{
          templateUrl: "/views/users/addedit.html",
          controller: "userController",
        }
      }
    })

    $locationProvider.hashPrefix('!');
  }]);

  //GA modification zhu
  app.run(['$rootScope','$location', '$window',
    function($rootScope,$location,$window) {
    $window.ga('create', 'UA-87754759-1', 'auto');
    $rootScope.$on('$stateChangeSuccess', function() {
      $window.ga('send', 'pageview', $location.path());
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    });
  }]);

  // app.run(['$rootScope',function($rootScope) {
  //   $rootScope.$on('$stateChangeSuccess', function() {
  //     document.body.scrollTop = document.documentElement.scrollTop = 0;
  //   });
  // }]);

  if (!window.WebSocket){
    window.location = "#!badbrowser";
  }

  //directives
  include "./directives/header.js"
  include "./directives/footer.js"
  include "./directives/branchtree.js"
  include "./directives/confirm-dialog.js"
  include "./directives/notification-dialog.js"
  include "./directives/comments.js"
  include "./directives/moderation.js"
  include "./directives/rating.js"
  include "./directives/subscribe.js"
  include "./directives/search-input.js"
  include "./directives/search-filter.js"
  include "./directives/search-results.js"
  //services
  include "./services/user-manager.js"
  include "./services/result-handler.js"
  include "./services/search-exchange.js"
  include "./services/picklists.js"
  include "./services/lastError.js"
  include "./services/publisher.js"
  include "./services/templater.js"
  //controllers
  include "./controllers/admin.js"
  include "./controllers/moderator.js"
  include "./controllers/auth.js"
  include "./controllers/home.js"
  include "./controllers/project.js"
  include "./controllers/publication.js"
  include "./controllers/resource.js"
  include "./controllers/comment.js"
  include "./controllers/user.js"
  include "./controllers/moderation.js"
  //return app
//})();

//(function() {
  var app = angular.module("branch", ["ui.router", "ngResource", "ngConfirm", "ngNotifications", "ngComments", "ngModeration", "ngRating", "ngSubscribe", "ngSanitize", "visualCaptcha" ]);

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
    //About Branch
    .state("aboutBranch", {
      url: "/aboutBranch",
      templateUrl: "/views/aboutBranch.html"
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
      templateUrl : "/views/reset.html",
      controller: "authController"
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
    //used to navigate to the blog list page
    .state("blogs", {
      url: "/blog",
      templateUrl: "/views/blogs/index.html",
      controller: "blogController"
    })
    //used to navigate to a given blog detail page
    .state("blogs.detail", {
      url: "/:blogId?status",
      views:{
        "@":{
          templateUrl: "/views/blogs/detail.html",
          controller: "blogController",
        }
      }
    })
    //used to navigate to a the blog add/edit page
    .state("blogs.addedit", {
      url: "/:blogId/edit",
      views:{
        "@":{
          templateUrl: "/views/blogs/addedit.html",
          controller: "blogController",
        }
      }
    })
    //used to navigate to the rc list page
    .state("rc", {
      url: "/resource",
      templateUrl: "/views/resourcecenter/index.html",
      controller: "resourceController"
    })
    //used to navigate to a given blog detail page
    .state("rc.detail", {
      url: "/:resourceId?status",
      views:{
        "@":{
          templateUrl: "/views/resourcecenter/detail.html",
          controller: "resourceController",
        }
      }
    })
    //used to navigate to a the blog add/edit page
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

  app.run(['$rootScope',function($rootScope) {
    $rootScope.$on('$stateChangeSuccess', function() {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    });
  }]);

  if (!window.WebSocket){
    window.location = "#!badbrowser";
  }

  //directives
  app.directive('header', ['userManager', '$state', '$interpolate', function(userManager, $state, $interpolate) {
      return {
          restrict: "A",
          replace: true,
          scope: {

          },
          templateUrl: "/views/header.html",
          controller: ['$scope', function($scope) {
              $scope.userManager = userManager;
              $scope.breadcrumb;

              $scope.$on("$stateChangeStart", function() {
                  $scope.breadcrumb = null;
              });

              $scope.$on('setCrumb', function(event, crumb) {
                  $scope.breadcrumb = crumb;
              });

              $("#navbar").on("click", "li a", null, function() {
                  if (!$(this).hasClass("dropdown-toggle")) {
                      $("#navbar").collapse('hide');
                  }
              });

              $scope.getLoginUrl = function() {
                  var suffix = "";

                  if ($state.$current.name != "home") {
                      suffix += "?url=";
                  }
                  if (window.location.hash.indexOf('login') == -1 && window.location.hash.indexOf('reset') == -1) {
                      suffix += window.location.hash.replace("#!/", "");
                  }
                  return "#!loginsignup" + suffix;
              }
          }]
      }
  }]);
  app.directive('footer', ['userManager', '$state', '$interpolate', function (userManager, $state, $interpolate) {
    return {
      restrict: "A",
      replace: true,
      scope:{

      },
      templateUrl: "/views/footer.html",
      controller: ['$scope', function($scope){
        $scope.userManager = userManager;
        $scope.breadcrumb;

        $scope.$on("$stateChangeStart", function(){
          $scope.breadcrumb = null;
        });
      }]
    }
  }]);

  app.directive("branchtree", ['$interval', function($interval) {
    return {
      restrict: "E",
      replace: true,
      scope: {
        width: '@',
        height: '@'
      },
      controller: ['$scope', '$element', function($scope, $element) {

        var width = $scope.width;
        var height = $scope.height;

        // Tree configuration
        var branches = [];
        var seed = {i: 0, x: width / 2 , y: height, a: 0, l: 70, d:0}; // a = angle, l = length, d = depth
        var da = 0.6; // Angle delta
        var dl = 0.8; // Length delta (factor)
        var ar = 0.4; // Randomness
        var maxDepth = 6;
        var animationbreak = 0;
        var loop;

        var svg = d3.select($element[0])
          .append('svg')
          .attr('width', width)
          .attr('height', height)


        function branch(b) {
          var end = endPt(b), daR, newB;
          branches.push(b);

          if (b.d === maxDepth)
            return;

          // Left branch
          daR = ar * Math.random() - ar * 0.5;
          newB = {
            i: branches.length,
            x: end.x,
            y: end.y,
            a: b.a - da + daR,
            l: b.l * dl,
            d: b.d + 1,
            parent: b.i
          };
          branch(newB);

          // Right branch
          daR = ar * Math.random() - ar * 0.5;
          newB = {
            i: branches.length,
            x: end.x,
            y: end.y,
            a: b.a + da + daR,
            l: b.l * dl,
            d: b.d + 1,
            parent: b.i
          };
          branch(newB);
        };

        function endPt(b) {
          // Return endpoint of branch
          var x = b.x + b.l * Math.sin( b.a );
          var y = b.y - b.l * Math.cos( b.a );
          return {x: x, y: y};
        };

        function x1(d) {return d.x;}
        function y1(d) {return d.y;}
        function x2(d) {return endPt(d).x;}
        function y2(d) {return endPt(d).y;}

        function create() {

          branches = [];
          branch(seed);

          svg.selectAll('line')
          .data(branches)
          .enter()
          .append('line')
          .style('stroke', '#8A8A8A')
          .style('opacity', 0.6)
          .style('stroke-width', function(d) { return parseInt(maxDepth + 1 - d.d) + 'px';})
          .attr('id', function(d) {return 'id-'+d.i;})
          .transition()
          .duration(500)
          .delay(function(d, i) { return i * 10; })
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2);

          loop = $interval(update, 4000, 30);

        };

        var update = function() {

          branches = [];
          branch(seed);

          svg.selectAll('line')
            .data(branches)
            .transition()
            .duration(2500)
            .attr('x1', x1)
            .attr('y1', y1)
            .attr('x2', x2)
            .attr('y2', y2)

        };
        
        create();
        
        $scope.$on('$destroy', function() {
          $scope.$destroy();
          $scope = null;
          $interval.cancel(loop);
          $element.remove();
          $element = null;
          update = null;
        })

      }]
    }
  }]);

  (function (root, factory) {
  	if (typeof exports === 'object') {
  		module.exports = factory(root, require('angular'));
  	} else if (typeof define === 'function' && define.amd) {
  		define(['angular'], function (angular) {
  			return (root.ngConfirm = factory(root, angular));
  		});
  	} else {
  		root.ngConfirm = factory(root, root.angular);
  	}
  }(this, function (window, angular) {
  	var module = angular.module('ngConfirm', []);
    module.provider('confirmConfig', function() {
      return {
  			$get: function(){
  				return {}
  			}
  		};
    });

    module.factory('confirm', ['$rootScope', function ($rootScope) {
  		return {
  			prompt: function(message, options, callbackFn){
  				$rootScope.$broadcast('confirmPrompt', {message: message, options: options, callbackFn: callbackFn});
  			}
  		};
    }]);


    module.directive('confirmDialog', ['confirmConfig', '$timeout', function (confirmConfig, $timeout) {
      return {
  			restrict: "E",
  			scope:{

  			},
        template: function(elem, attr){
          html = "<div class='confirm-smokescreen' ng-class='{active:active==true, wide:options.requireComment==true}'>";
          html += "<div class='confirm-dialog'>";
          html += "<p>{{message}}</p>";
  				html += "<textarea class='form-control' ng-model='comment' ng-if='options.requireComment'></textarea>";
          html += "<ul>";
          html += "<li ng-repeat='option in options.options'><button class='branch-button' ng-click='returnOption($index)'>{{option}}</button></li>";
          html += "</ul>";
          html += "</div>";
  	      html += "</div>";
  				return html;
        },
        controller: ['$scope', function(scope){
  				scope.$on('confirmPrompt', function(event, data){
            scope.message = data.message;
            scope.options = data.options;
            scope.callback = data.callbackFn;
            scope.active = true;
          });
          scope.returnOption = function(index){
  					var comment = $(".confirm-dialog textarea").val();
  					scope.message = null;
            scope.options = null;
            scope.active = false;
  					scope.callback.call(null, {result: index, comment: comment});
            //scope.callback = null;
          };
        }]
      }
    }]);

  	return module;
  }));

  (function (root, factory) {
  	if (typeof exports === 'object') {
  		module.exports = factory(root, require('angular'));
  	} else if (typeof define === 'function' && define.amd) {
  		define(['angular'], function (angular) {
  			return (root.ngConfirm = factory(root, angular));
  		});
  	} else {
  		root.ngConfirm = factory(root, root.angular);
  	}
  }(this, function (window, angular) {
  	var module = angular.module('ngNotifications', []);
    module.provider('notificationConfig', function() {
      return {
  			$get: function(){
  				return {}
  			}
  		};
    });

    module.factory('notifications', ['$rootScope', function ($rootScope) {
  		return {
  			notify: function(message, list, options){
  				$rootScope.$broadcast('notify', {message: message, list: list, options: options});
  			}
  		};
    }]);


    module.directive('notificationDialog', ['notificationConfig', '$timeout', function (notificationConfig, $timeout) {
      return {
  			restrict: "E",
  			scope:{

  			},
        template: function(elem, attr){
          html = "<div ng-show='showing' class='{{options.sentiment}} col-md-12 notifications'>";
  				html += "<p>{{message}}</p>";
  				html += "<ul ng-if='list.length>0'>";
  				html += "<li ng-repeat='item in list'>";
  				html += "{{item}}"
  				html += "</li>";
  				html += "</ul>";
  	      html += "</div>";
  				return html;
        },
        controller: ['$scope', function($scope){
  				$scope.$on('notify', function(event, data){
  					$scope.showing = true;
            $scope.message = data.message || "";
  					$scope.list = data.list || [];
  					$scope.options = data.options || {};
          });
        }]
      }
    }]);

  	return module;
  }));

  (function (root, factory) {
  	if (typeof exports === 'object') {
  		module.exports = factory(root, require('angular'));
  	} else if (typeof define === 'function' && define.amd) {
  		define(['angular'], function (angular) {
  			return (root.ngConfirm = factory(root, angular));
  		});
  	} else {
  		root.ngConfirm = factory(root, root.angular);
  	}
  }(this, function (window, angular) {
  	var module = angular.module('ngComments', []);
    module.provider('commentsConfig', function() {
      return {
  			$get: function(){
  				return {}
  			}
  		};
    });

    module.factory('comments', ['$rootScope', function ($rootScope) {
  		return {

  		};
    }]);

    module.directive('comments', ['commentsConfig', '$timeout', function (confirmConfig, $timeout) {
      return {
  			restrict: "A",
  			scope:{
          entity: "=",
          entityid: "=",
  				parent: "="
  			},
        templateUrl: "/views/comments.html",
        link: ['$scope', function(scope){

        }],
        controller: "commentController"
      }
    }]);

  	return module;
  }));

  (function (root, factory) {
  	if (typeof exports === 'object') {
  		module.exports = factory(root, require('angular'));
  	} else if (typeof define === 'function' && define.amd) {
  		define(['angular'], function (angular) {
  			return (root.ngConfirm = factory(root, angular));
  		});
  	} else {
  		root.ngConfirm = factory(root, root.angular);
  	}
  }(this, function (window, angular) {
  	var module = angular.module('ngModeration', []);
    module.provider('moderationConfig', function() {
      return {
  			$get: function(){
  				return {}
  			}
  		};
    });

    module.factory('moderation', ['$rootScope', function ($rootScope) {
  		return {

  		};
    }]);

    module.directive('moderation', ['moderationConfig', '$timeout', function (confirmConfig, $timeout) {
      return {
  			restrict: "E",
  			replace: true,
  			scope:{
          entity: "=",
          entityid: "=",
  				owner: "=",
  				approved: "=",
  				flagged: "=",
  				flagcount: "=",
  				editable: "=",
  				download: "=",
  				size: "=",
  				orientation: "="
  			},
        templateUrl: "/views/moderation.html",
        controller: "moderationController"
      }
    }]);

  	return module;
  }));

  (function (root, factory) {
  	if (typeof exports === 'object') {
  		module.exports = factory(root, require('angular'));
  	} else if (typeof define === 'function' && define.amd) {
  		define(['angular'], function (angular) {
  			return (root.ngConfirm = factory(root, angular));
  		});
  	} else {
  		root.ngConfirm = factory(root, root.angular);
  	}
  }(this, function (window, angular) {
  	var module = angular.module('ngRating', []);
    module.provider('ratingConfig', function() {
      return {
  			$get: function(){
  				return {}
  			}
  		};
    });

    module.factory('rating', ['$root$scope', function ($root$scope) {
  		return {

  		};
    }]);

    module.directive('rating', ['ratingConfig', '$resource', '$timeout', 'resultHandler', function (resultConfig, $resource, $timeout, resultHandler) {
      return {
  			restrict: "E",
  			replace: true,
  			scope:{
          entity: "=",
          entityid: "=",
  				user: "=",
          mode: "=",
          displaystar: "="
  			},
        templateUrl: "/views/rating.html",
        controller: ['$scope', function($scope){
          var Rating = $resource("/api/rating/:ratingId", {ratingId: "@ratingId"});

          $scope.$watch('user', function(newVal, oldVal){
            if($scope.user && $scope.entityid && $scope.mode!='static'){
              $scope.getRating();
            }
          });

          $scope.$watch('entityid', function(newVal, oldVal){
            if($scope.user && $scope.entityid && $scope.mode!='static'){
              $scope.getRating();
            }
          });

          $scope.stars = [1,2,3,4,5];

          $scope.displayStar;
          $scope.pointsMap = {
            "1": -2,
            "2": -1,
            "3": 1,
            "4": 2,
            "5": 3
          };

          $scope.getStar = function(){
            if($scope.displaystar){
              return Math.round($scope.displaystar);
            }
            else if ($scope.myRating && $scope.myRating.rating) {
              return Math.round($scope.myRating.rating);
            }
            else{
              return null;
            }
          };

          $scope.setDisplayStar = function(star){
            if($scope.mode=='static') {
              return
            }
            $scope.displaystar = star;
          };
          $scope.clearDisplayStar = function(){
            if($scope.mode=='static') {
              return
            }
            $scope.displaystar = null;
          };

          $scope.getRating = function(){
            Rating.get({entityId: $scope.entityid, userid: $scope.user}, function(result){
              if(resultHandler.process(result)){
                $scope.myRating = result.data[0] || {};
              }
            });
          };

          $scope.rate = function(rating){
            var query = {};
            if($scope.myRating && $scope.myRating._id){
              query.ratingId = $scope.myRating._id;
              $scope.myRating.entityId = $scope.entityid;
              $scope.myRating.rating = rating;
              $scope.myRating.points = $scope.pointsMap[rating];
            }
            else{
              $scope.myRating = {
                entityId: $scope.entityid,
                rating: rating,
                points: $scope.pointsMap[rating]
              };
            }
            Rating.save(query, $scope.myRating, function(result){
              if(resultHandler.process(result)){

              }
            })
          };
        }]
      }
    }]);

  	return module;
  }));

  (function (root, factory) {
  	if (typeof exports === 'object') {
  		module.exports = factory(root, require('angular'));
  	} else if (typeof define === 'function' && define.amd) {
  		define(['angular'], function (angular) {
  			return (root.ngConfirm = factory(root, angular));
  		});
  	} else {
  		root.ngConfirm = factory(root, root.angular);
  	}
  }(this, function (window, angular) {
  	var module = angular.module('ngSubscribe', []);
    module.provider('subscribeConfig', function() {
      return {
  			$get: function(){
  				return {}
  			}
  		};
    });

    module.factory('subscribe', ['$rootScope', function ($rootScope) {
  		return {

  		};
    }]);

    module.directive('subscribe', ['subscribeConfig', '$resource', '$timeout', 'resultHandler', 'notifications', function (subscribeConfig, $resource, $timeout, resultHandler, notifications) {
      return {
  			restrict: "E",
  			replace: true,
  			scope:{
          entity: "=",
          entityid: "=",
  				user: "="
  			},
        template: function(elem, attr){
          var html = "<button class='button-outline' ng-show='user' ng-click='toggleSubscription()' ng-disabled='{{subscribing==true}}'><i class='fa fa-envelope-o'></i>{{buttonText}}</button>";
          return html;
        },
        controller: ['$scope', function(scope){
          scope.buttonText = "Please wait...";
          var Subscribe = $resource("/api/subscription/:subId", {subId: "@subId"});

          scope.$watch('user', function(newVal, oldVal){
            if(scope.user && scope.entityid){
              scope.setup();
            }
          });

          scope.$watch('entityid', function(newVal, oldVal){
            if(scope.user && scope.entityid){
              scope.setup();
            }
          });

          scope.setup = function(){
            Subscribe.get({entityId: scope.entityid, userid: scope.user}, function(result){
              if(resultHandler.process(result)){
                scope.subscription = result.data[0];
                if(scope.subscription){
                  scope.buttonText = "Unsubscribe";
                }
                else{
                  scope.buttonText = "Subscribe";
                }
              }
            });
          };

          scope.toggleSubscription = function(){
  					scope.subscribing=true;
  					if(scope.subscription){
  						Subscribe.delete({subId: scope.subscription._id}, function(result){
  							scope.subscribing=false;
  							if(resultHandler.process(result)){
  								notifications.notify("You have successfully unsubscribed.", null, {sentiment:"positive"});
  								scope.buttonText = "Subscribe";
  							}else{
  								notifications.notify(result.errText, null, {sentiment:"negative"});
  							}
  						});
  					}
  					else{
  						Subscribe.save({entityId: scope.entityid, userid: scope.user}, function(result){
  							scope.subscribing=false;
  							if(resultHandler.process(result)){
  								scope.subscription = result;
  								notifications.notify("You have successfully subscribed.", null, {sentiment:"positive"});
  								scope.buttonText = "Unsubscribe";
  							}else{
  								notifications.notify(result.errText, null, {sentiment:"negative"});
  							}
  						});
  					}
          };

        }]
      }
    }]);

  	return module;
  }));

  app.directive('searchInput', ['$state', '$interpolate', "confirm", function ($state, $interpolate, confirm) {
    return {
      restrict: "E",
      replace: true,
      $scope:{

      },
      templateUrl: "/views/search/search-input.html",
      controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
        $.ajax({type: "GET", dataType: "text", contentType: "application/json", url: '/configs/'+$attrs.config+'.json', success: function(json){
          $scope.config = JSON.parse(json);
          var inputTimeout;
          var ignoreKeys = [
            16,
            27
          ];
          var reservedKeys = [ //these keys should not execute another search, they are reserved for the suggestions mechanism or are navigationkeys (page up/page down)
            9,
            13,
            38,
            40,
            39,
            37,
            32,
            33,
            34
          ];

          var Key = {
              BACKSPACE: 8,
              ESCAPE: 27,
              TAB: 9,
              ENTER: 13,
              SHIFT: 16,
              UP: 38,
              DOWN: 40,
              RIGHT: 39,
              LEFT: 37,
              DELETE: 46,
              SPACE: 32
          };

          $scope.searchText;

          $scope.searchTimeout = 300;
          $scope.suggestTimeout = 100;
          $scope.searchTimeoutFn;
          $scope.suggestTimeoutFn;
          $scope.suggesting = false;
          $scope.activeSuggestion = 0;

          $scope.cursorPosition = 0;

          searchExchange.subscribe('cleared', $attrs.view+".input", function(){
            $scope.searchText = "";
            if(el = document.getElementById("branch-search-input")){
              el.value = "";
            }
            $scope.cursorPosition = 0;
            $scope.suggestions = [];
            $scope.suggesting = false;
            $scope.activeSuggestion = 0;
            $scope.ghostPart = "";
            $scope.ghostQuery = "";
            $scope.ghostDisplay = "";
            
            setTimeout(function(){
              $scope.preSearch();
            }, 0);
          });

          searchExchange.subscribe('reset', $attrs.view+".input", function(){
            $scope.searchText = "";
            if(el = document.getElementById("branch-search-input")){
              el.value = "";
            }
            $scope.cursorPosition = 0;
            $scope.suggestions = [];
            $scope.suggesting = false;
            $scope.activeSuggestion = 0;
            $scope.ghostPart = "";
            $scope.ghostQuery = "";
            $scope.ghostDisplay = "";

          });

          searchExchange.subscribe('suggestResults', $attrs.view+".input", function(handle, results){

            $scope.suggestions = results.qSuggestions;
            $scope.suggestions.splice(5, results.qSuggestions.length - 4);
            $scope.showSuggestion();
          });



          $scope.keyDown = function(event){
            if(event.keyCode == Key.ESCAPE){
              $scope.hideSuggestion();
              return;
            }
            else if(event.keyCode == Key.DOWN){
              //show the suggestions again
              $scope.showSuggestion();
            }
            else if(event.keyCode == Key.RIGHT){
              //activate the next suggestion
              if($scope.suggesting){
                event.preventDefault();
                $scope.nextSuggestion();
              }
            }
            else if(event.keyCode == Key.LEFT){
              //activate the previous suggestion
              if($scope.suggesting){
                event.preventDefault();
                $scope.prevSuggestion();
              }
            }
            else if(event.keyCode == Key.ENTER || event.keyCode == Key.TAB){
              if($scope.suggesting){
                event.preventDefault();
                $scope.acceptSuggestion();
              }
            }
            else if(event.keyCode == Key.SPACE){
              //we'll check here to make sure the latest term is at least 2 characters
              if($scope.searchText.split(" ").length==5){
                confirm.prompt("I hate to break it to you but you can only search for 5 things. Must try harder!", {options:["Thanks, I accept this without question"]}, function(response){
                });
                event.preventDefault();
                return false;
              }
              else if($scope.searchText.split(" ").pop().length==1){
                confirm.prompt("You'll need to search for something longer than '"+$scope.searchText.split(" ").pop()+"'", {options:["That makes sense."]}, function(response){
                });
                event.preventDefault();
                return false;
              }
              else{
                $scope.hideSuggestion();
              }
            }
            else{
              $scope.hideSuggestion();
            }

          };

          $scope.keyUp = function(event){
            $scope.cursorPosition = event.target.selectionStart;
            if(ignoreKeys.indexOf(event.keyCode) != -1){
              return;
            }
            if(reservedKeys.indexOf(event.keyCode) == -1){
              if($scope.searchText && $scope.searchText.length > 0){
                //we'll check here to make sure the latest term is at least 2 characters before searching
                if($scope.searchText.split(" ").pop().length>1){
                  $scope.preSearch();
                  $scope.preSuggest();
                }
              }
              else{
                //clear the search
                $scope.clear();
              }
            }
          };

          $scope.nextSuggestion = function(){
            if($scope.activeSuggestion==$scope.suggestions.length-1){
              $scope.activeSuggestion = 0;
            }
            else{
              $scope.activeSuggestion++;
            }
            $scope.drawGhost();
          };
          $scope.prevSuggestion = function(){
            if($scope.activeSuggestion==0){
              $scope.activeSuggestion = $scope.suggestions.length-1;
            }
            else{
              $scope.activeSuggestion--;
            }
            $scope.drawGhost();
          };
          $scope.hideSuggestion = function(){
            $scope.suggesting = false;
            $scope.activeSuggestion = 0;
            $scope.ghostPart = "";
            $scope.ghostQuery = "";
            $scope.ghostDisplay = "";
          };
          $scope.showSuggestion = function(){
            if($scope.searchText && $scope.searchText.length > 1 && $scope.cursorPosition==$scope.searchText.length && $scope.suggestions.length > 0){
              $scope.suggesting = true;
              $scope.drawGhost();
            }
            else{
              $scope.suggesting = false;
              $scope.removeGhost();
            }
          };
          $scope.setAndAccept = function(index){
            $scope.activeSuggestion = index;
            $scope.drawGhost();
            $scope.acceptSuggestion();
          }
          $scope.acceptSuggestion = function(){
            $scope.searchText = $scope.ghostQuery;
            $scope.suggestions = [];
            $scope.hideSuggestion();
            $scope.preSearch();
          };
          $scope.drawGhost = function(){
            $scope.ghostPart = getGhostString($scope.searchText, $scope.suggestions[$scope.activeSuggestion].qValue);
            $scope.ghostQuery = $scope.searchText + $scope.ghostPart;
            $scope.ghostDisplay = "<span style='color: transparent;'>"+$scope.searchText+"</span>"+$scope.ghostPart;
          }
          $scope.removeGhost = function(){
            $scope.ghostPart = null;
            $scope.ghostQuery = null;
            $scope.ghostDisplay = null;
          }

          $scope.preSuggest = function(){
            if($scope.searchText.length > 1 && $scope.cursorPosition==$scope.searchText.length){
              if($scope.suggestTimeoutFn){
                clearTimeout($scope.suggestTimeoutFn);
              }
              $scope.suggestTimeoutFn = setTimeout(function(){
                searchExchange.suggest($scope.searchText, $scope.config.suggestFields || []);
              }, $scope.suggestTimeout);
            }
          };

          $scope.preSearch = function(){
            if($scope.searchTimeoutFn){
              clearTimeout($scope.searchTimeoutFn);
            }
            $scope.searchTimeoutFn = setTimeout(function(){
              searchExchange.search($scope.searchText, $scope.config.searchFields || []);
            }, $scope.searchTimeout);
          };

          $scope.clear = function(){
            searchExchange.clear();
          };

          searchExchange.subscribe("executeSearch", $attrs.view+".input", function(){
            setTimeout(function(){
              $scope.searchText = "";
              if(searchExchange.state){
                if(searchExchange.state && searchExchange.state.searchText){
                  $scope.searchText = searchExchange.state.searchText;
                  document.getElementById("branch-search-input").value = $scope.searchText;
                }
              }
              $scope.preSearch();
            },0);
          });

          searchExchange.subscribe("update", $attrs.view+".input", function(){
            if(!$scope.searchText){
              if(searchExchange.state && searchExchange.state.searchText){
                $scope.searchText = searchExchange.state.searchText;
                //document.getElementById("branch-search-input").value = $scope.searchText;
              }
            }
          });

          function getGhostString(query, suggestion){
            var suggestBase = query;
            if(suggestion.toLowerCase().indexOf(suggestBase.toLowerCase())!=-1){
              //the suggestion pertains to the whole query

            }
            else if(suggestion.length > suggestBase.length){
              //this must apply to a substring of the query
              while(suggestion.toLowerCase().indexOf(suggestBase.toLowerCase())==-1){
                suggestBase = suggestBase.split(" ");
                suggestBase.splice(0,1);
                suggestBase = suggestBase.join(" ");
              }
            }
            while(suggestBase.length >= suggestion.length && suggestBase.toLowerCase()!=suggestion.toLowerCase()){
              suggestBase = suggestBase.split(" ");
              suggestBase.splice(0,1);
              suggestBase = suggestBase.join(" ");
            }
            var re = new RegExp(suggestBase, "i")
            return suggestion.replace(re,"");
          }
        }});
      }]
    }
  }]);

  app.directive("searchFilter", [function(){
    return {
      restrict: "E",
      replace: true,
      scope: {

      },
      controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
        $scope.title = $attrs.title;
        $scope.handle;
        $scope.items;

        $scope.toggleValue =  function(elemNum){
          $scope.$parent.toggleSelect($attrs.field, elemNum);
        }
        $scope.$on('searchResults', function(){
          if($scope.handle){
            $scope.render();
          }
          else{
            $scope.postponed = function(){
              $scope.render();
            }
          }
        });

        $scope.$on('initialising', function(){
          $scope.loading = true;
        });

        $scope.$on('initialised', function(){
          if($scope.handle){
            $scope.render();
          }
          else{
            $scope.postponed = function(){
              $scope.render();
            }
          }
        });

        searchExchange.subscribe("update", $attrs("id"), function(params){
          setTimeout(function(){
            if($scope.handle){
              $scope.render();
            }
            else{
              $scope.postponed = function(){
                $scope.render();
              }
            }
          },0);
        });
        $scope.$on('cleared', function(){
          if($scope.handle){
            $scope.render();
          }
          else{
            $scope.postponed = function(){
              $scope.render();
            }
          }
        });

        $scope.render = function(){
          searchExchange.ask($scope.handle, "GetLayout", [], function(response){
            var layout = response.result.qLayout;
            searchExchange.ask($scope.handle, "GetListObjectData", ["/qListObjectDef",[{qTop:0, qLeft:0, qHeight:layout.qListObject.qSize.qcy, qWidth: 1 }]], function(response){
              var data = response.result.qDataPages;
              $scope.items = data[0].qMatrix;
              $scope.$apply();
            });
          });
        };

        $scope.selectValue = function(value){
          searchExchange.ask($scope.handle, "SelectListObjectValues", ["/qListObjectDef", [value], true], function(response){
          //$scope.info.object.selectListObjectValues("/qListObjectDef", [value], true).then(function(){
            searchExchange.render();
          });
        };

        searchExchange.addFilter({
            id: $($element).$attrs("id"),
            field: $attrs.field
          }, function(result){
          //$scope.$apply(function(){
            $scope.handle = result.handle;
            if($scope.postponed){
              $scope.postponed.call(null);
            }
            //$scope.$apply();
            // else{
            //   $scope.render();
            // }

          //});
        });

      }],
      templateUrl: "/views/search/search-filter.html"
    }
  }])

  app.directive("searchResults", ["$resource", "$state", "$stateParams", "userManager", "resultHandler", "publisher", function($resource, $state, $stateParams, userManager, resultHandler, publisher){
    return {
      restrict: "E",
      replace: true,
      scope: {

      },
      controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
        $.ajax({type: "GET", dataType: "text", contentType: "application/json", url: '/configs/'+$attrs.config+'.json', success: function(json){
          $scope.config = JSON.parse(json);
          $scope.template = $scope.config.template;
          $scope.fields = $scope.config.fields;
          $scope.qFields;
          $scope.sortOptions = $scope.config.sorting;
          $scope.sort = $scope.sortOptions[$scope.config.defaultSort];
          $scope.elemId = $attrs.id;
          var Entity;
          if($scope.config.entity){
            Entity = $resource("/api/" + $scope.config.entity + "/:id", {id: "@id"});
          }

          $scope.highlightText = function(text){
            if(searchExchange.state && searchExchange.state.searchText){
              var terms = searchExchange.state.searchText.split(" ");
              for (var i=0;i<terms.length;i++){
                text = text.replace(new RegExp(terms[i], "i"), "<span class='highlight"+i+"'>"+terms[i]+"</span>")
              }
              return text;
            }
            else{
              return text;
            }
          };

          $scope.loading = true;

          $scope.items = [];

          $scope.hidden = [];

          $scope.flagged = {};

          $scope.stars = new Array(5);

          $scope.postponed;
          $scope.resultsTemplateCallback;
          $scope.pagingTemplateCallback;

          $scope.pageTop = 0;
          $scope.pageBottom = $scope.config.pagesize;
          $scope.currentPage = 1;
          $scope.pages = [];

          $scope.broadcast = function(fnName, params){
            $scope.$root.$broadcast(fnName, params);
          };

          $scope.getHidden = function(){
            if(Entity){
              Entity.get({id: "hidden"}, {
                limit: 100  //if we have more than 100 hidden items we have some housekeeping to do
              }, function(result){
                if(resultHandler.process(result)){
                  $scope.hidden = result.data;
                }
              });
            }
          };

          $scope.getFlagged = function(){
            if(Entity){
              Entity.get({id: "flagged"}, {
                limit: 100  //if we have more than 100 flagged items we have some housekeeping to do
              }, function(result){
                if(resultHandler.process(result)){
                  //$scope.flagged = result.data;
                  if(result.data){
                    for(var i=0;i<result.data.length;i++){
                      $scope.flagged[result.data[i].entityId] = true;
                    }
                  }
                }
              });
            }
          };

          $scope.getHidden();
          $scope.getFlagged();

          $scope.isHidden = function(id){
            for(var i=0;i<$scope.hidden.length;i++){
              if($scope.hidden[i]._id == id){
                return true;
              }
            }
            return false;
          };

          $scope.isFlagged = function(id){
            if($scope.flagged){
              for(var i=0;i<$scope.flagged.length;i++){
                if($scope.flagged[i].entityId == id){
                  return true;
                }
              }
              return false;
            }
            return false;
          };

          searchExchange.subscribe("searching", $attrs.view, function(){
            $scope.loading = true;
            $scope.pageTop = 0;
            if(el = document.getElementById($attrs.id+"_loading")){
              document.getElementById($attrs.id+"_loading").style.display = "block";
            }
            if(el = document.getElementById($attrs.id+"_list_container")){
              document.getElementById($attrs.id+"_list_container").style.display = "none";
            }
            if(el = document.getElementById($attrs.id+"_no_results")){
              document.getElementById($attrs.id+"_no_results").style.display = "none";
            }
          });

          searchExchange.subscribe("noresults", $attrs.view, function(handles, data){
            $scope.renderEmpty();
          });

          searchExchange.subscribe("update", $attrs.view, function(handles, data){
            updateResume(handles);
          });
          searchExchange.subscribe("resume", $attrs.view, function(handles, data){
            updateResume(handles);
          });

          function updateResume(handles){
            setTimeout(function(){
              if(searchExchange.state && searchExchange.state.sort){
                $scope.sort = searchExchange.state.sort;
              }
              if(searchExchange.state!=null && (searchExchange.state.page!=null)){
                $scope.pageTop = ($scope.config.pagesize * searchExchange.state.page);
              }
              if($scope.handle){
                if(handles){
                  if(handles.indexOf($scope.handle)!=-1){
                      $scope.render();
                  };
                }
                else{
                  $scope.render();
                }
              }
              else{
                $scope.postponed = function(){
                  if(handles){
                    if(handles.indexOf($scope.handle)!=-1){
                        $scope.render();
                    };
                  }
                  else{
                    $scope.render();
                  }
                }
              }
            },100);
          }

          $scope.showItem = function(approved, entity){
            return approved=='True' || userManager.canApprove(entity);
          };

          $scope.changePage = function(direction){
            $scope.pageTop += ($scope.config.pagesize * direction);
            $scope.render();
          };

          $scope.setPage = function(pageNumber){
            searchExchange.setStateAttr("page", pageNumber);
            $scope.pageTop = ($scope.config.pagesize * pageNumber);
            $scope.render();
          }

          $scope.pageInRange = function(pageIndex){
  					var minPage, maxPage;
  					if($scope.pages.length==1){
  						return false;
  					}
  					else if($scope.currentPage <= 2){
  						minPage = 1;
  						maxPage = 5
  					}
  					else if ($scope.currentPage >= $scope.pages.length - 2) {
  						minPage = $scope.pages.length - 5;
  						maxPage = $scope.pages.length;
  					}
  					else{
  						minPage = $scope.currentPage - 2;
  						maxPage = $scope.currentPage + 2;
  					}
  					return (pageIndex >= minPage && pageIndex <= maxPage);
  				};

          $scope.render = function(){
            if(el = $("#"+$attrs.id).find("._list")[0]){

            }
            else{
              return;
            }
            searchExchange.ask($scope.handle, "GetLayout", [], function(response){
              var layout = response.result.qLayout;
              $scope.qFields = layout.qHyperCube.qDimensionInfo.concat(layout.qHyperCube.qMeasureInfo);
              searchExchange.ask($scope.handle, "GetHyperCubeData", ["/qHyperCubeDef", [{qTop: $scope.pageTop, qLeft:0, qHeight: $scope.config.pagesize, qWidth: $scope.fields.length }]], function(response){
                var data = response.result.qDataPages;
                var items = [];
                var hiddenCount = 0;
                $scope.$apply(function(){
                  $scope.loading = false;
                  $scope.pageTop = data[0].qArea.qTop;
                  $scope.pageBottom = (data[0].qArea.qTop + data[0].qArea.qHeight);
                  $scope.currentPage = Math.ceil($scope.pageBottom / $scope.config.pagesize);
                  $scope.total = layout.qHyperCube.qSize.qcy;
                  $scope.pages = [];
                  for(var i=1;i<(Math.ceil($scope.total/$scope.config.pagesize)+1);i++){
                    $scope.pages.push(i);
                  }
                  $scope.items = [];
                  var totals = {};
                  var max = {};
                  var min = {};
                  for(var i=0;i<layout.qHyperCube.qMeasureInfo.length;i++){
                    max[layout.qHyperCube.qMeasureInfo[i].qFallbackTitle] = layout.qHyperCube.qMeasureInfo[i].qMax;
                    min[layout.qHyperCube.qMeasureInfo[i].qFallbackTitle] = layout.qHyperCube.qMeasureInfo[i].qMin;
                    totals[layout.qHyperCube.qMeasureInfo[i].qFallbackTitle] = layout.qHyperCube.qGrandTotalRow[i].qNum;
                  }
                  for(var i=0;i<data[0].qMatrix.length;i++){
                    var item = {}
                    //if the nullSuppressor field is null then we throw out the row
                    if($scope.config.nullSuppressor!=null && data[0].qMatrix[i][$scope.config.nullSuppressor].qText=="-"){
                      continue;
                    }
                    for (var j=0; j < data[0].qMatrix[i].length; j++){
                      item[$scope.qFields[j].qFallbackTitle] = data[0].qMatrix[i][j].qText;

                    }
                    if(item["rating"]!="-"){
                      item.stars = [];
                      var stars = parseInt(item.rating);
                      for(var k=0;k<stars;k++){
                        item.stars.push(k);
                      }
                    }
                    item.hidden = $scope.isHidden(item[$scope.config.primaryKey]);
                    if(item.hidden){
                      hiddenCount++;
                    }
                    items.push( item );
                  }

                  var sortEl = $("#"+$attrs.id).find("._sort")[0];
                  selectSortOption(sortEl, $scope.sort);

                  if(hiddenCount==items.length){
                    if(!userManager.hasUser){
                      $scope.renderEmpty();
                      return;
                    }
                    else if (!userManager.canApprove($scope.entity)) {
                      $scope.renderEmpty();
                      return;
                    }
                  }
                  if(items.length>0){
                    $scope.loading = false;
                    $scope.items = items;
                    //$element.find(".result-list").html("test");
                    var terms = []
                    if(searchExchange.state && searchExchange.state.searchText){
                      terms = searchExchange.state.searchText.split(" ");
                    }
                    $("#"+$attrs.id).find("._count_label")[0].innerHTML = "Showing " + ($scope.pageTop+1) + " - " + $scope.pageBottom + " of " + $scope.total + " results";
                    if($scope.resultsTemplate){
                      $("#"+$attrs.id).find("._list")[0].innerHTML = $scope.resultsTemplate.getHTML({items:items, terms: terms, totals: totals, max:max, min:min, bucket: $scope.$root.bucket});
                    }
                    else{
                      $scope.resultsTemplateCallback = function(){
                        $("#"+$attrs.id).find("._list")[0].innerHTML = $scope.resultsTemplate.getHTML({items:items, terms: terms, totals: totals, max:max, min:min, bucket: $scope.$root.bucket});
                      }
                    }
                    if($scope.pagingTemplate){
                      $("#"+$attrs.id).find("._paging")[0].innerHTML = $scope.pagingTemplate.getHTML({currentPage:$scope.currentPage, pages: $scope.pages});
                    }
                    else{
                      $scope.pagingTemplateCallback = function(){
                        $("#"+$attrs.id).find("._paging")[0].innerHTML = $scope.pagingTemplate.getHTML({currentPage:$scope.currentPage, pages: $scope.pages});
                      }
                    }
                    $("#"+$attrs.id).find("._list_container")[0].style.display = "block";
                    $("#"+$attrs.id).find("._no_results")[0].style.display = "none";
                  }
                  else{
                    $scope.loading = false;
                    $("#"+$attrs.id).find("._list_container")[0].style.display = "none";
                    $("#"+$attrs.id).find("._no_results")[0].style.display = "block";
                    $scope.items = [];
                  }
                  $("#"+$attrs.id).find("._loading")[0].style.display = "none";
                  if(layout.qHyperCube.qSize.qcx < $scope.fields.length){
                    $scope.pageWidth();
                  }
                });
              });
            });
          };

          $scope.renderEmpty = function(){
              $scope.loading = false;
              $("#"+$attrs.id).find("._loading")[0].style.display = "none";
              $("#"+$attrs.id).find("._list_container")[0].style.display = "none";
              $("#"+$attrs.id).find("._no_results")[0].style.display = "block";
              $scope.items = [];
          };

          $scope.pageWidth = function(){  //we currently only support paging width once (i.e. up to 20 fields)
            //$scope.info.object.getHyperCubeData("/qHyperCubeDef", [{qTop: $scope.pageTop, qLeft:10, qHeight: $scope.config.pagesize, qWidth: $scope.fields.length }]).then(function(data){
            searchExchange.ask($scope.handle, "GetLayout", [], function(response){
              var layout = response.qLayout;
              $scope.qFields = layout.qHyperCube.qDimensionInfo.concat(layout.qHyperCube.qMeasureInfo);
              searchExchange.ask($scope.handle, "GetHyperCubeData", ["/qHyperCubeDef", [{qTop: $scope.pageTop, qLeft:10, qHeight: $scope.config.pagesize, qWidth: $scope.fields.length }]], function(response){
                var data = response.qDataPages;
                $scope.$apply(function(){
                  data[0].qMatrix.map(function(row, index){
                    var item = $scope.items[index];
                    for (var i=0; i < row.length; i++){
                      item[$scope.qFields[i].qFallbackTitle] = row[i].qText;
                    }
                    return item;
                  });
                });
              });
            });
          };

          $scope.applySort = function(sort, render){
            searchExchange.setStateAttr("sort", sort);
            searchExchange.ask($scope.handle, "ApplyPatches", [[{
              qPath: "/qHyperCubeDef/qInterColumnSortOrder",
              qOp: "replace",
              qValue: getFieldIndex(sort.field)
            }], true], function(){
              if(render && render==true){
                $scope.render();
              }
            });
          };

          function getFieldIndex(field, asString){
            for (var i=0;i<$scope.fields.length;i++){
              if($scope.fields[i].dimension && $scope.fields[i].dimension==field){
                if(asString!=undefined && asString==false){
                  return [i];
                }
                else {
                  return "["+i+"]";
                }
              }
              else if ($scope.fields[i].label && $scope.fields[i].label==field) {
                if(asString!=undefined && asString==false){
                  return [i];
                }
                else {
                  return "["+i+"]";
                }
              }
            }
            return 0;
          };

          function selectSortOption(elem, option){
            for (var i=0;i<elem.options.length;i++){
              if(elem.options[i].value == option.id){
                elem.options[i].setAttribute('selected','')
              }
              else{
                elem.options[i].removeAttribute('selected')
              }
            }
          }

          $scope.$root.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
            //if there is an existing state we should update the pageTop property on the scope
            //and apply patches to the object for sorting
            if(fromState.name.split(".")[0]==toState.name.split(".")[0]){ //then we should clear the search state
              if(toState.name.split(".").length==1){ //we only need to do this if we're on a listing page
                if(searchExchange.state && searchExchange.state.sort){
                  $scope.applySort(searchExchange.state.sort);
                }
              }
            }
          });

          $scope.$root.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams){
            if(toState.name.split(".").length==1){ //we only need to do this if we're on a listing page
              if(searchExchange.state){
                if(searchExchange.state.page || searchExchange.state.sort){
                  searchExchange.render();
                }
              }
            }
          });


          searchExchange.addResults({
              id: $attrs.id,
              fields: $scope.fields,
              sortOptions: $scope.sortOptions,
              defaultSort: getFieldIndex($scope.sort.field, false)
            }, function(result){
              $scope.handle = result.handle;
              if(!$scope.resultsTemplate){
                $.get($scope.template).success(function(html){
                  $scope.resultsTemplate = new Templater(html);
                  if($scope.resultsTemplateCallback){
                    $scope.resultsTemplateCallback.call();
                    $scope.resultsTemplateCallback = null;
                  }
                });
              }
              if(!$scope.pagingTemplate){
                $.get("/views/search/search-paging.html").success(function(html){
                  $scope.pagingTemplate = new Templater(html);
                  if($scope.pagingTemplateCallback){
                    $scope.pagingTemplateCallback.call();
                    $scope.pagingTemplateCallback = null;
                  }
                });
              }
              if($scope.postponed){
                $scope.postponed.call();
              }
              else{
                if($attrs.id.indexOf("users.")==-1){
                  updateResume([result.handle]);
                }
              }
            });

        }});
      }],
      templateUrl: "/views/search/search-results.html"
    }
  }])

  //services
  app.service('userManager', ['$resource', function($resource){
    var System = $resource("system/:path", {path: "@path"});
    this.menu = {};
    this.userInfo = {};
    var that = this;
    this.refreshing = false;
    this.canUpdateAll = function(entity){
      return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].allOwners && this.userInfo.role.permissions[entity].allOwners==true;
    }
    this.canCreate = function(entity){
      return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].create && this.userInfo.role.permissions[entity].create==true;
    }
    this.canRead = function(entity){
      return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].read && this.userInfo.role.permissions[entity].read==true;
    }
    this.canUpdate = function(entity, owner){
      if (this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].update && this.userInfo.role.permissions[entity].update==true){
        if(!this.userInfo.role.permissions[entity].allOwners || this.userInfo.role.permissions[entity].allOwners==false){
          if(this.userInfo._id==owner){
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return true
        }
      }
    }
    this.canApprove = function(entity){
      return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].approve && this.userInfo.role.permissions[entity].approve==true;
    }
    this.canFlag = function(entity){
      return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].flag && this.userInfo.role.permissions[entity].flag==true;
    }
    this.canHide = function(entity){
      return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].hide && this.userInfo.role.permissions[entity].hide==true;
    }
    this.canDelete = function(entity, owner){
      if (this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].delete && this.userInfo.role.permissions[entity].delete==true){
        if(!this.userInfo.role.permissions[entity].allOwners || this.userInfo.role.permissions[entity].allOwners==false){
          if(this.userInfo._id==owner){
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return true
        }
      }
    }
    this.hasUser = function(){
      return !$.isEmptyObject(that.userInfo);
    }
    this.refresh = function(callbackFn){
      this.refreshing = true;
      System.get({path:'userInfo'}, function(result){
        that.menu = result.menu;
        that.userInfo = result.user;
        if(callbackFn){
          callbackFn.call(null, that.hasUser());
        }
      });
    }
    this.hasPermissions = function(){
      return this.userInfo && this.userInfo.role && this.userInfo.role.permissions;
    }
    this.refresh();
  }]);

  app.service('resultHandler', ["notifications", function(notifications){
    this.processing = false;
    this.process = function(result, action, preventRedirect){   //deals with the result in a generic way. Return true if the result is a success otherwise returns false
      if(result.redirect && !preventRedirect){  //should only redirect a user to the login page
        if(!this.processing){
          this.processing = true;
          window.location = result.redirect + "?url=" + window.location.hash.replace("#!/","");
        }
        return false;
      }
      else if (result.errCode) {
        console.log(result);
        return false;
      }
      else {
        return true;
      }
    }
  }]);

  var SearchExchange = (function(){

    function SearchExchange(){
      var that = this;
      this.seqId = 0;

      this.objects = {};
      this.online = false;

      this.clearing = false;

      this.priority = [];
      this.queue = [];

      this.pendingSearch;
      this.pendingSuggest;

      this.state;

      this.view;

      this.catalog = {};

      $.ajax({type: "GET", dataType: "text", contentType: "application/json", url: '/configs/sense.json', success: function(json){

        var config = JSON.parse(json);

        qsocks.Connect(config).then(function(global){
          global.openDoc(config.appname).then(function(app){
            senseApp = app;
            var old = senseApp.connection.ws.onmessage
            senseApp.connection.ws.onmessage = function(ev){
              var msg = JSON.parse(ev.data);
              if( msg.suspend ) {
                that.publish('resume');
              } else if(old != null) {
                old(ev);
              }
            };
            that.seqId = senseApp.connection.seqid;
            //$rootScope.$broadcast("senseready", app);
            that.online = true;
            //this sets up a constant ping to ensure the websocket stays connected
            function ping(){
              that.ask(-1, "ProductVersion", [],function(result){});
              setTimeout(function(){
                ping();
              },30000);
            }
            ping();
            that.publish('online');
          }, function(error) {
              if (error.code == "1002") { //app already opened on server
                  global.getActiveDoc().then(function(app){
                    senseApp = app;
                    //$rootScope.$broadcast("senseready", app);
                  });
              } else {
                  console.log(error)
                  $rootScope.$broadcast("senseoffline");
              }
          });
        });

      }});

        this.subscribe = function(eventName, id, callbackFn){
          if(!that.catalog[eventName]){
            that.catalog[eventName] = {};
          }
          if(that.catalog[eventName][id]){
            delete that.catalog[eventName][id];
          }
          that.catalog[eventName][id] = {fn: callbackFn};
        };

        this.unsubscribe = function(eventName, id){
          delete that.catalog[eventName][id];
        };

        this.publish = function(eventName, handles, data){
          if(that.catalog[eventName]){
            if(that.view && eventName!="online"){
              for(var sub in that.catalog[eventName]){
                if(sub.split(".")[0].indexOf(that.view)!=-1){
                  that.catalog[eventName][sub].fn.call(null, handles, data);
                }
              }
            }
            else{
              var ind = 0;
              for(var sub in that.catalog[eventName]){
                that.catalog[eventName][sub].fn.call(null, handles, data);
                ind++;
              }
            }
          }
        };

        this.subscribe('online', 'clear', function(){
          that.clear(true);
        });

        this.setStateAttr = function(name, prop){
          if(!that.state){
            that.state = {};
          }
          that.state[name] = prop;
        };

        this.matched;

        var senseApp;

        this.init = function(defaultSelections){
          if(defaultSelections && defaultSelections.length > 0){
            defaultSelections.forEach(function(selection, index){
              that.makeSelection(selection, function(result) {
                if(index==defaultSelections.length-1){
                  that.lockSelections(function(result){
                    that.executePriority();
                  })
                }
              }, true);
            });
          }
          else{
            that.executePriority();
          }
        };

        this.executeQueue = function(){
          if(that.queue.length > 0){
            for (var i=0;i<that.queue.length;i++){
              that.queue[i].call();
              if(i==that.queue.length-1){
                that.queue = [];
                if(that.online){
                  that.publish("update");
                }
                else{
                  that.subscribe('online', 'queue', function(){
                    that.publish("update")
                  });
                }
              }
            }
          }
          else {
            if(that.online){
              that.publish("update");
            }
            else{
              that.subscribe('online', 'queue', function(){
                that.publish("update")
              });
            }
            //$rootScope.$broadcast("update");
          }
        };

        this.executePriority = function(){
          if(that.priority && that.priority.length > 0){
            that.priority.forEach(function(priorityFn, index){
              priorityFn.call(null);
              if(index = that.priority.length-1){
                that.priority = [];
                that.executeQueue();
              }
            })
          }
          else{
            that.executeQueue();
          }
        };

        this.clear = function(unlock){
          this.clearing = true;
          var handles;
          that.state = null;
          if(senseApp){
            if(unlock && unlock==true){
              that.ask(senseApp.handle, "UnlockAll", [], function(result){
                that.ask(senseApp.handle, "ClearAll", [],function(result){
                  this.clearing = false;
                  that.publish('reset');
                });
              });
            }
            else{
              that.ask(senseApp.handle, "ClearAll", [],function(result){
                this.clearing = false;
                that.publish('cleared');
              });
            }
          }
          else{
          }
        };

        this.render = function(){
          that.publish('update');
        }
        this.fresh = function(){
            this.search("");
        }
        this.setPage = function(page){
          if(!this.state){
            this.state = {};
          }
          this.state.page = page-1;
          this.publish('update');
        }

        this.search = function(searchText, searchFields){
          that.setStateAttr("searchText", searchText);
          that.setStateAttr("searchFields", searchFields);

          that.publish("searching");
          that.terms = searchText.split(" ");

          that.seqId++;
          that.pendingSearch = that.seqId;
          senseApp.connection.ask(senseApp.handle, "SearchAssociations", [{qContext: "LockedFieldsOnly", qSearchFields: searchFields}, that.terms, {qOffset: 0, qCount: 5, qMaxNbrFieldMatches: 5}], that.seqId).then(function(response){
            if(response.id == that.pendingSearch){
              if(searchText=="" || response.result.qResults.qTotalSearchResults>0){
                that.ask(senseApp.handle, "SelectAssociations", [{qContext: "LockedFieldsOnly", qSearchFields:searchFields}, that.terms, 0], function(response){
                  that.publish('update', response.change);
                });
              }
              else{
                that.publish('noresults', response.change);
              }
            }
          });
        };

        this.suggest = function(searchText, suggestFields){
          that.seqId++;
          that.pendingSuggest = that.seqId;
          senseApp.connection.ask(senseApp.handle, "SearchSuggest", [{qContext: "LockedFieldsOnly", qSearchFields: suggestFields}, searchText.split(" ")], that.seqId).then(function(response){
            if(response.id == that.pendingSuggest){
              that.publish('suggestResults', null, response.result.qResult);
            }
          });
        };

        this.addFilter = function(options, callbackFn, priority){
          var fn;
          if(that.objects[options.id]){
            fn = function(){
              callbackFn.call(null, {handle:that.objects[options.id]});
            }
          }
          else{
            fn = function(){
              var lbDef = {
                qInfo:{
                  qType: "ListObject"
                },
                qListObjectDef:{
                  qStateName: "$",
                  qDef:{
                    qFieldDefs:[options.field]
                  },
                  qAutoSortByState: {
                    qDisplayNumberOfRows: 8
                  }
                }
              };
              that.seqId++;
              senseApp.connection.ask(senseApp.handle, "CreateSessionObject", [lbDef], that.seqId).then(function(response){
                that.objects[options.id] = response.result.qReturn.qHandle;
                callbackFn.call(null, {handle: response.result.qReturn.qHandle});
              });
            };
          }
          if(that.online){
            fn.call();
          }
          else{
            that.subscribe('online', options.field, fn);
          }
        };

        this.makeSelection = function(options, callbackFn, priority){
          if(f = that.objects[options.field]){
            fn = function(){
              that.ask(f, "SelectValues", [options.values], function(response){
                callbackFn.call(null, response);
              });
            }
          }
          else{
            fn = function(){
              that.ask(senseApp.handle, "GetField" ,[options.field], function(response){
                that.objects[options.field] = response.result.qReturn.qHandle;
                that.ask(response.result.qReturn.qHandle, "SelectValues", [options.values], function(response){
                  callbackFn.call(null, response);
                });
              });
            };
          }
          if(that.online){
            fn.call();
          }
          else{
            that.subscribe('online', options.field, fn);
          }
        };

        that.lockSelections = function(callbackFn){
          fn = function(){
            that.ask(senseApp.handle, "LockAll", [], function(result){
              callbackFn.call(null);
            });
          }
          if(that.online){
            fn.call();
          }
          else{
            that.subscribe('online', 'lock', fn);
          }
        }

        this.addResults = function(options, callbackFn, priority){
          if(that.objects[options.id]){
            fn = function(){
              callbackFn.call(null, {handle:that.objects[options.id]});
            };
          }
          else{
            fn = function(){
              var hDef = {
                "qInfo" : {
                    "qType" : "table"
                },
                "qHyperCubeDef": {
                  "qDimensions" : buildFieldDefs(options.fields, options.sortOptions),
                  "qMeasures": buildMeasureDefs(options.fields),
                	"qSuppressZero": false,
                	"qSuppressMissing": false,
                	"qInterColumnSortOrder": options.defaultSort
                }
              }
              that.seqId++;
              senseApp.connection.ask(senseApp.handle, "CreateSessionObject", [hDef], that.seqId).then(function(response){
                that.objects[options.id] = response.result.qReturn.qHandle;
                callbackFn.call(null, {handle:response.result.qReturn.qHandle});
              });
            };
          }
          if(that.online){
            fn.call();
          }
          else{
            that.subscribe('online', options.id, fn);
          }
        };

        this.ask = function(handle, method, args, callbackFn){
          that.seqId++;
          senseApp.connection.ask(handle, method, args, that.seqId).then(function(response){
            callbackFn.call(null, response);
          });
        }

        function buildFieldDefs(fields, sorting){
          var defs = [];
          for (var i=0;i<fields.length;i++){
            if(fields[i].dimension){
              var def = {
          			"qDef": {
          				"qFieldDefs": [fields[i].dimension]
                },
                qNullSuppression: fields[i].suppressNull
          		}
              if(sorting[fields[i].dimension]){
                var sort = {};
                sort[sorting[fields[i].dimension].sortType] = sorting[fields[i].dimension].order;
                def["qDef"]["qSortCriterias"] = [sort];
              }
              defs.push(def);
            }
          }
          return defs;
        }

        function buildMeasureDefs(fields){
          var defs = [];
          for (var i=0;i<fields.length;i++){
            if(fields[i].measure){
              var def = {
                "qDef": {
        					"qLabel": fields[i].label,
        					"qDescription": "",
        					"qDef": fields[i].measure
        				}
              }
              if(fields[i].sortType){
                def["qSortBy"] = {};
                def["qSortBy"][fields[i].sortType] = fields[i].order;
              }
              defs.push(def);
            }
          };
          return defs;
        }
    }

    return SearchExchange;

  }());

  var searchExchange = new SearchExchange();

  app.service('picklistService', ['$resource', 'resultHandler', function($resource, resultHandler){
    var Picklist = $resource("api/picklist/:picklistId", {picklistId: "@picklistId"});
    var PicklistItem = $resource("api/picklistitem/:picklistitemId", {picklistitemId: "@picklistitemId"});

    this.getPicklistItems = function(picklistName, callbackFn){
      Picklist.get({name: picklistName}, function(result){
        if(resultHandler.process(result)){
          if(result.data && result.data[0]){
            PicklistItem.get({picklistId: result.data[0]._id}, function(result){
              if(resultHandler.process(result)){
                callbackFn.call(null, result.data);
              }
            });
          }
        }
      });
    };

  }]);

  app.service('lastError', ['$resource', function($resource){
    var LastError = $resource("system/lasterror");

    this.checkForErrors = function(callbackFn){
      LastError.get({}, function(result){
        callbackFn.call(null, result);
      });
    };

  }]);

  app.service('publisher', ["$rootScope", function($rootScope){
    var that = this;
    this.catalog = {};

    this.subscribe = function(eventName, id, callbackFn){
      if(!that.catalog[eventName]){
        that.catalog[eventName] = {};
      }
      if(!that.catalog[eventName][id]){
        that.catalog[eventName][id] = {fn: callbackFn};
      }
    };

    this.publish = function(eventName, data){
      if(that.catalog[eventName]){
        for(var sub in that.catalog[eventName]){
          that.catalog[eventName][sub].fn.call(null, data);
        }      
      }
    };
  }]);

  var Templater = (function(){

      //var templateHTML, compiledHTML, pieces=[];


      function Templater(html, attributes){
         //One single line and one space only
         var vDomEl = document.createElement('div');
         vDomEl.innerHTML = html;
         html = vDomEl.innerHTML;
         html = html.replace(/(?:\r\n|\r|\n|\t|\n\t| \n\t)/g, '');
         html = html.replace(/\s{2,}/g, ' ');

         this.pieces = null;
         this.evalFn = null;
         this.templateHTML = html;

         if (html.indexOf('qs-repeat=') !== -1
             || html.indexOf('qs-show=') !== -1
             || html.indexOf('qs-if=') !== -1){
             this.evalFn = repeater(html);
         }else {
             this.pieces = parse(html);
         }
     }

      function parse(html){
          var pattern = /({{([^#^!^/].*?)}})/g;
          var pieces = [];
          while (s=pattern.exec(html)){
              pieces.push({what:s[0], item:s[0].replace("{{","").replace("}}","")});
          }
          return pieces;
      }

      function repeater(html){
          var htmlObj = document.createElement('div');
          htmlObj.innerHTML = html;
          var evalFn = [];

          var ifElms = htmlObj.querySelectorAll('[qs-if]');
          if (ifElms.length > 0){
              for (var i=0; i<ifElms.length;i++){
                  var htmlItem = getHTMLString(ifElms[i]);
                  var expression = (ifElms[i].attributes)? ifElms[i].attributes["qs-if"].value : null;
                  evalFn.push({
                      'type':'qs-if',
                      'htmlItem': htmlItem,
                      'expression': expression
                  });
              }
          }

          var repeatElms = htmlObj.querySelectorAll('[qs-repeat]');
          if (repeatElms.length > 0){
              for (var i=0; i<repeatElms.length;i++){
                  var htmlItem = getHTMLString(repeatElms[i]);
                  var expression = repeatElms[i].attributes["qs-repeat"].value.split(' '),
                      dimension = expression[expression.length-1],
                      loop = expression[0]+' '+'in'+' data["'+dimension+'"]';

                  evalFn.push({
                      'type': 'qs-repeat',
                      'htmlItem': htmlItem,
                      'dimension': dimension,
                      'repeater': expression[0],
                      'loop': loop,
                      'repeatPieces': parse(htmlItem)
                  });
              }
          }

          var showElms = htmlObj.querySelectorAll('[qs-show]');
          if (showElms.length > 0){
              for (var i=0; i<showElms.length;i++){
                  var htmlItem = getHTMLString(showElms[i]);
                  var expression = (showElms[i].attributes)? showElms[i].attributes["qs-show"].value : null;

                  evalFn.push({
                      'type':'qs-show',
                      'htmlItem': htmlItem,
                      'expression': expression
                  });
              }
          }

          var hideElms = htmlObj.querySelectorAll('[qs-hide]');
          if (hideElms.length > 0){
              for (var i=0; i<hideElms.length;i++){
                  var htmlItem = getHTMLString(hideElms[i]);
                  var expression = (hideElms[i].attributes)? hideElms[i].attributes["qs-hide"].value : null;

                  evalFn.push({
                      'type':'qs-hide',
                      'htmlItem': htmlItem,
                      'expression': expression
                  });
              }
          }

          var refElms = htmlObj.querySelectorAll('[qs-ref]');
          if (refElms.length > 0){
              for (var i=0; i<refElms.length;i++){
                  var htmlItem = getHTMLString(refElms[i]);
                  var expression = (refElms[i].attributes)? refElms[i].attributes["qs-ref"].value : null;

                  evalFn.push({
                      'type':'qs-ref',
                      'htmlItem': htmlItem,
                      'expression': expression
                  });
              }
          }

          htmlObj.innerHTML = null;

          return evalFn;
      }

      function getRepeatBlock(params, evalIterator, data, iteration){
          var that = this;
          var htmlString = params.htmlItem;
          for(var i=0;i<params.repeatPieces.length;i++){
              try{
                  var what = params.repeatPieces[i].what;
                  var fields = params.repeatPieces[i].item.split('.');
                  var item = what;
                  if (fields[0] == params.repeater){
                      fieldFormatter = fields[fields.length-1].split(":");
                      var df = fieldFormatter[1] || null;
                      item = evalIterator;
                      if (fields.length > 1){
                        var item = data;
                        for(var ii=1;ii<fields.length;ii++){
                          prop = fields[ii];
                          if(prop.indexOf(":")){
                            prop = prop.split(":")[0];
                          }
                          if(item){
                            item = item[prop];
                          }
                        }

                        //item = data[prop];
                      }
                      if(item){
                        if(df){
                          //currently only supports date or time
                          try{
                            var date = new Date(parseInt(item));
                            if(df=="Date"){
                              var day = date.getDate();
                              var monthIndex = date.getMonth();
                              var year = date.getFullYear();
                              var output = day + ' ' + monthNames[monthIndex] + ' ' + year
                            }
                            if(df=="Time"){
                              var output = date.getHours() + ':' + (date.getMinutes()<10?'0':'')+date.getMinutes();
                            }
                            htmlString = htmlString.replace(what, output);
                          }
                          catch(err){

                          }
                        }
                        else{
                          //must be text
                          htmlString = htmlString.replace(what, highlightText(item, this.terms));
                        }
                      }
                  }
                  else if(fields[0]=="$"){
                    item = parseInt(evalIterator)+1;
                    if(item){
                        htmlString = htmlString.replace(what, item);
                    }
                  }

              }
              catch(err){
                  console.log("error", htmlString);
              }
          }

          var myEval = function(expr){
              var rootExpr;
              if(expr.indexOf("(")==-1){
                rootExpr = expr.split(".");
                if(rootExpr.length>1){
                  rootExpr.splice(0,1);
                }
                rootExpr = rootExpr.join(".");
              }
              var s = true;
              try{
                if(expr.indexOf("(")!=-1){
                  eval('s='+expr);
                }
                else{
                  eval('var o=data; if (that.data.'+rootExpr+' || data.'+rootExpr+' || that.data.'+expr+' || data.'+expr+' || '+expr+') { s=true; } else { s=false; }');
                }
              }
              catch(err){
                s = false;
              }
              finally{

              }
              return s;
          };

          var fn = repeater(htmlString);
          var fnAlt = repeater(htmlString);
          //hide/remove any items for the show/if conditions
          for (var k=0; k<fn.length;k++){  //then we can run again and update the if/show blocks
            //this is a test.
            //if 2 of these exist in the same markup then only the first 1 runs
            //this is because it changes the html and subsequently the replace doesn't work
            //now we're keeping k at 0 and re-evaluating fn on each iteration
            //in theory the array should reduce each time until we're done
            if (fn[k].type === 'qs-if'){
                if (myEval(fn[k].expression) === false){
                    //Remove dom element from template
                    fn[k]['htmlItem'] = fn[k]['htmlItem'].replace(/&amp;/g, '&');
                    htmlString = htmlString.replace(fn[k]['htmlItem'], '');
                }
                fn = repeater(htmlString);
            }
            else  if (fn[k].type === 'qs-show'){
              var show = (myEval(fn[k].expression));
              if(show === true){
                fn[k]['htmlItem'] = fn[k]['htmlItem'].replace(/&amp;/g, '&');
                if(htmlString.indexOf(fn[k]['htmlItem'])!=-1){
                  var str = fn[k]['htmlItem'].replace('qs-show', 'style="display:inherit;" qs-done');
                  htmlString = htmlString.replace(fn[k]['htmlItem'], str);
                }
                fn = repeater(htmlString);
              }
            }
            else  if (fn[k].type === 'qs-hide'){
                var show = (myEval(fn[k].expression));
                if(show === true){
                  fn[k]['htmlItem'] = fn[k]['htmlItem'].replace(/&amp;/g, '&');
                  if(htmlString.indexOf(fn[k]['htmlItem'])!=-1){
                    var str = fn[k]['htmlItem'].replace('qs-hide', 'style="display:none;" qs-done');
                    htmlString = htmlString.replace(fn[k]['htmlItem'], str);
                  }
                  fn = repeater(htmlString);
                }
            }
            else  if (fn[k].type === 'qs-ref'){
                var loc = window.location.hash.split("?")[0];
                loc += "?" + fn[k].expression;
                loc = loc.replace(/%22/g, "");
                //var show = (myEval(fn[k].expression) === true)? 'none' : 'block';
                fn[k]['htmlItem'] = fn[k]['htmlItem'].replace(/&amp;/g, '&');
                if(htmlString.indexOf(fn[k]['htmlItem'])!=-1){
                  var str = fn[k]['htmlItem'].replace('qs-ref', 'href='+loc+' qs-done');
                  htmlString = htmlString.replace(fn[k]['htmlItem'], str);
                }
                fn = repeater(htmlString);
            }
            else{
              //break;
            }
          }

          //check to see if we need to repeat again
          if (fnAlt && fnAlt.length > iteration){
            for (var j=iteration; j<fnAlt.length; j++){
              //on the first pass we're just looking for repeat blocks
              if (fnAlt[j].type === 'qs-repeat'){
                  htmlString = repeat.call(this, htmlString, fnAlt[j]['htmlItem'], fnAlt[j], data[fnAlt[j]['dimension']], j);
                  break;  //we break out of the loop after the first execution. The repeater block should handle embedded repeats
              }
            }
          }


          return htmlString;
      }

      Templater.prototype = Object.create(Object.prototype, {
          getHTML:{
              value: function(data){
                var that = this;
                  this.compiledHTML = this.templateHTML;
                  this.data = data;
                  this.terms = data.terms;
                  var myEval = function(expr){
                    var rootExpr = expr.split(".");
                      if(rootExpr.length>1){
                        rootExpr.splice(0,1);
                      }
                      rootExpr = rootExpr.join(".");
                      var s = true;
                      try{
                        eval('var o=data; if (that.data.'+rootExpr+' || data.'+rootExpr+' || that.data.'+expr+' || data.'+expr+' || '+expr+') { s=true; } else { s=false; }');
                      }
                      catch(err){
                        s = false;
                      }
                      finally{
                      }
                      return s;
                  };

                  var fn = this.evalFn;
                  if (fn && fn.length > 0){
                      for (var i=0; i<fn.length; i++){
                        //on the first pass we're just looking for repeat blocks
                        if (fn[i].type === 'qs-repeat'){
                            this.compiledHTML = repeat.call(this, this.compiledHTML, fn[i]['htmlItem'], fn[i], data[fn[i]['dimension']], i);
                            break;  //we break out of the loop after the first execution. The repeater block should handle embedded repeats
                        }
                      }
                      //DUE TO CONFLICTS IN REPEATED COMPONENTS 'QS-IF' IS CURRENTLY NOT EXECUTED AT A PARENT LEVEL
                      for (var i=0; i<fn.length; i++){  //then we can run again and update the if/show blocks
                        // if (fn[i].type === 'qs-if'){
                        //     if (myEval(fn[i].expression) === false){
                        //         //Remove dom element from template
                        //         fn[i]['htmlItem'] = fn[i]['htmlItem'].replace(/&amp;/g, '&');
                        //         this.compiledHTML = this.compiledHTML.replace(fn[i]['htmlItem'], '');
                        //     }
                        //}else
                        if (fn[i].type === 'qs-show'){
                            var show = (myEval(fn[i].expression) === true)? 'inherit' : 'none';
                            fn[i]['htmlItem'] = fn[i]['htmlItem'].replace(/&amp;/g, '&');
                            if(this.compiledHTML.indexOf(fn[i]['htmlItem'])!=-1){
                              var str = fn[i]['htmlItem'].replace('qs-show', 'style="display:'+show+'" qs-done');
                              this.compiledHTML = this.compiledHTML.replace(fn[i]['htmlItem'], str);
                            }
                        }
                        else  if (fn[i].type === 'qs-hide'){
                            var show = (myEval(fn[i].expression) === true)? 'none' : 'inherit';
                            fn[i]['htmlItem'] = fn[i]['htmlItem'].replace(/&amp;/g, '&');
                            if(this.compiledHTML.indexOf(fn[i]['htmlItem'])!=-1){
                              var str = fn[i]['htmlItem'].replace('qs-hide', 'style="display:'+show+'" qs-done');
                              this.compiledHTML = this.compiledHTML.replace(fn[i]['htmlItem'], str);
                            }
                        }
                      }
                  }
                  //if (!this.pieces){
                      this.pieces = parse(this.compiledHTML);
                  //}

                  for(var i=0;i<this.pieces.length;i++){
                      try{
                        //check to see if the piece refers to a child property
                        var props = this.pieces[i].item.split(".");
                        var result = data;
                        for (var p in props){
                          result = result[props[p]];
                        }
                        if(result){
                          this.compiledHTML = this.compiledHTML.replace(this.pieces[i].what, result);
                        }
                      }
                      catch(err){
                          console.log("error", data.toString());
                      }
                  }
                  return this.compiledHTML;
              }
          }

      });

      function repeat(compiledHTML, oriString, fn, data, iteration){
        iteration++;
        var repeatBlokHTML = '';
        var oriString = fn['htmlItem'];
        if(compiledHTML.indexOf(oriString) !== -1){
            for (var t in data){
                repeatBlokHTML += getRepeatBlock.call(this, fn, t, data[t], iteration);
            }
            return compiledHTML.replace(oriString, repeatBlokHTML);
        }
        return "";
      }

      function getHTMLString(node){
          if(!node || !node.tagName) return '';
          if(node.outerHTML) return node.outerHTML;

          var wrapper = document.createElement('div');
          wrapper.appendChild(node.cloneNode(true));
          var strHTML = wrapper.innerHTML;
          wrapper.innerHTML = null;
          return strHTML;
      }

      function highlightText(text, terms){
        //NOTE THIS FUNCTION ALSO STRIPS OUT ANY HTML TAGS
        text = text.replace(/<\/?[^>]+(>|$)/g, "");
        if(terms){
          for (var i=0;i<terms.length;i++){
            text = text.replace(new RegExp(terms[i], "i"), "<span class='highlight"+i+"'>"+terms[i]+"</span>")
          }
        }
        return text;
      };

      function withinRange(page, current, max, range){
        var minPage, maxPage;
        if(max==1){
          return false;
        }
        else if(current <= 2){
          minPage = 1;
          maxPage = range
        }
        else if (current >= max - 2) {
          minPage = max - range;
          maxPage = max;
        }
        else{
          minPage = current - 2;
          maxPage = current + 2;
        }
        return (page >= minPage && page <= maxPage);
      };

      var monthNames = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct",
        "Nov", "Dec"
      ];

      return Templater;

  }());

  //controllers
  app.controller("adminController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "confirm", function ($scope, $resource, $state, $stateParams, userManager, resultHandler, confirm) {
    var User = $resource("api/userprofile/:userId", {userId: "@userId"});
    var Project = $resource("api/project/:projectId", {projectId: "@projectId"});
    var Blog = $resource("api/blog/:blogId", {blogId: "@blogId"});
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
      "blog",
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

    $scope.setFeature = function (entity, id) {
      $scope.getItem(entity, id, function (result) {
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
    };

    $scope.getItem = function (entity, id, callbackFn) {
      if (entity == "project") {
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
      }
      else if (entity == "blog") {
        Blog.get({blogId: id}, function (result) {
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
      }
    };

    $scope.saveFeature = function () {
      Feature.save({featureId: $scope.features[$scope.activeFeature]._id}, $scope.currentFeature, $scope.features[$scope.activeFeature], function (result) {
        if (resultHandler.process(result)) {
          $scope.setActiveFeature($scope.activeFeature);
        }
      });
    };

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

  app.controller("moderatorController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "confirm", function($scope, $resource, $state, $stateParams, userManager, resultHandler, confirm){
    var Flags = $resource("api/flag/:flagId", {flagId: "@flagId"});

    //check to see that a user is logged in and that they have the correct permissions
    var entities = [
      "project",
      "blog",
      "comment",
      "user"
    ]

    $scope.isModerator = false;

    $scope.activeTab = 0;

    $scope.showComments = false;

    $scope.commentsType;
    $scope.commentsTitle;
    $scope.comments = [];

    $scope.commentsTemplate;

    if(!$scope.commentsTemplate){
      $.get("/views/moderator/moderator-comments.html").success(function(html){
        $scope.commentsTemplate = new Templater(html);
      });
    }

    var defaultSelection;

    $scope.setTab = function(index){
      $scope.activeTab = index;
      searchExchange.clear();
    };

    searchExchange.subscribe('clearFlags', "moderatorController", function(flagType, id){
      Flags.save({entityId: id, flagType: flagType}, {flagged: false}, function(result){
        if(resultHandler.process(result)){

        }
      });
    });

    searchExchange.subscribe('viewComments', "moderatorController", function(handles, id){
      $scope.commentsTitle = handles[1];
      var flagType = handles[0];
      $scope.commentType = handles[0]=='flag' ? 'Flag' : 'Spam';
      Flags.get({entityId: id, flagType: flagType, flagged: true}, function(results){
        if(resultHandler.process(results)){
          document.getElementById("moderator_comments").innerHTML = $scope.commentsTemplate.getHTML({commentType: $scope.commentType, commentsTitle: $scope.commentsTitle, comments: results.data});
          document.getElementById("moderator_comments_container").style.display = "block";
        }
      });
    });

    searchExchange.subscribe('closeComments', "moderatorController", function(){
      document.getElementById("moderator_comments").innerHTML = "";
      document.getElementById("moderator_comments_container").style.display = "none";
    });

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
      if(!userManager.hasUser()){
        userManager.refresh(function(hasUser){
          if(!hasUser){
            window.location = "#!login?url=moderator";
          }
          else{
            var ents = [];
            for(var i=0;i<entities.length;i++){
              if(userManager.canApprove(entities[i])){
                $scope.isModerator = true;
                ents.push({qText: entities[i]});
              }
            }
            defaultSelection = [{
              field: "DocType",
              values: ents
            }];
          }
          console.log($scope.isModerator);
          if(!$scope.isModerator){
              window.location = "/";
          }
          //this effectively initiates the results
          searchExchange.subscribe('reset', "moderator", function(){
            searchExchange.init(defaultSelection);
            searchExchange.unsubscribe('reset', "moderator");
          });
          if((fromState.name.split(".")[0]!=toState.name.split(".")[0]) || fromState.name=="loginsignup"){
            searchExchange.clear(true);
          }
        });
      }
      else{
        var ents = [];
        for(var i=0;i<entities.length;i++){
          if(userManager.canApprove(entities[i])){
            $scope.isModerator = true;
            ents.push({qText: entities[i]});
          }
        }
        defaultSelection = [{
          field: "DocType",
          values: ents
        }];
        if(!$scope.isModerator){
            window.location = "/";
        }
        searchExchange.subscribe('reset', "moderator", function(){
          searchExchange.init(defaultSelection);
          searchExchange.unsubscribe('reset', "moderator");
        });
        if((fromState.name.split(".")[0]!=toState.name.split(".")[0]) || fromState.name=="loginsignup"){
          searchExchange.clear(true);
        }
      }
    });

    $scope.setTab(0);

  }]);

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
              email: $scope.email,
              company: $scope.company,
              country: $scope.country,
              fullname: $scope.fullname
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

  app.controller("homeController", ["$rootScope","$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", function($rootScope, $scope, $resource, $state, $stateParams, userManager, resultHandler){
    var Feature = $resource("api/feature/:featureId", {featureId: "@featureId"});
    var Project = $resource("api/project/:projectId", {projectId: "@projectId"});
    var Article = $resource("api/blog/:blogId", {blogId: "@blogId"});

    $scope.featuredProject = {};
    $scope.featuredArticle = {};
    
    $rootScope.headTitle = "Welcome to Qlik Branch";
    $rootScope.metaKeys = "Branch, Qlik Branch, Qlik Sense, Qlik, Data Analytics, Data Visualization, QlikView, Developers, APIs, Github, Open Source, Developer Relations, Innovation";
    $rootScope.metaDesc = "Qlik Branch is a game-changing platform for web developers using Qlik's APIs to accelerate innovation in bringing the best ideas to market. Rooted in open source philosophy, all projects are freely distributed and modified, allowing faster collaboration and innovation.";
    $rootScope.metaImage = "http://branch.qlik.com/resources/branch_logo.png";
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

  app.controller("projectController", ["$rootScope","$scope", "$resource", "$state", "$stateParams", "$anchorScroll", "userManager", "resultHandler", "confirm", "notifications", "picklistService", function($rootScope, $scope, $resource, $state, $stateParams, $anchorScroll, userManager, resultHandler, confirm, notifications, picklistService){
    var Project = $resource("api/project/:projectId", {projectId: "@projectId"});
    var Views = $resource("api/view/count");
    var Picklist = $resource("api/picklist/:picklistId", {picklistId: "@picklistId"});
    var PicklistItem = $resource("api/picklistitem/:picklistitemId", {picklistitemId: "@picklistitemId"});
    var Git = $resource("system/git/:path", {path: "@path"});
    var Rating = $resource("api/rating");
    var MyRating = $resource("api/rating/rating/my");

    var defaultSelection;

    $rootScope.headTitle = "Open Source Projects on Qlik Branch";
    $rootScope.metaKeys = "Branch, Qlik Branch, Qlik Sense, Qlik, Open Source, Github, Projects, Extensions, Mash-ups, API, QAP, Qlik Analytics Platform";
    $rootScope.metaDesc = "Qlik Branch integrates with Github to host open source projects leveraging Qlik's extensibility and APIs.  Find code to use as a foundation for your next project, share your work, or get inspired."
    $rootScope.metaImage = "http://branch.qlik.com/resources/branch_logo.png";

    $scope.dirtyThumbnail = false;

    $scope.gitCreds = {};

    $scope.userManager = userManager;

    $scope.gitAuthenticated = userManager.userInfo.linked_to_github;
    $scope.Confirm = confirm;

    $scope.isNew = $stateParams.projectId=="new";

    $scope.projects = [];
    $scope.gitProjects = [];
    $scope.url = "projects";

    $scope.searching = true;

    $scope.projectLoading = !$scope.isNew;
    $scope.gitLoading = false;

    $scope.rating = {};
    $scope.getRate = {};
    $scope.query = {
      limit: $scope.pageSize
    };

    if($stateParams.sort && $scope.sortOptions[$stateParams.sort]){
      $scope.sort = $scope.sortOptions[$stateParams.sort];
    }

    if($stateParams.projectId){
      $scope.query.projectId = $stateParams.projectId;
      $scope.projectId = $stateParams.projectId;
    }

    $scope.ratingClick = function() {
      //$('#rating').css({'color': 'green', 'border':'0 none'})
      if($scope.rate && !$scope.isReadonly) {
        $scope.isReadonly = true;
        $scope.query.votenum = $scope.projects[0].votenum + 1
        $scope.query.votetotal = $scope.projects[0].votetotal + $scope.rate

        $scope.updateProjectData($scope.query)

        $scope.rating.id = $scope.projects[0]._id
        $scope.rating.userid = $stateParams.userId
        $scope.rating.rate = $scope.rate
        $scope.rating.date = new Date()

        var ratingquery = {
          entityId: $scope.rating.id,
          userid: $scope.rating.userid,
          createdate: $scope.rating.date,
          rating: $scope.rating.rate
        }

        $scope.saveRating(ratingquery)
      }
    };

    $scope.getProductVersions = function(product){
      picklistService.getPicklistItems(product.name + " Version", function(items){
        $scope.productVersions = items;
      });
    };

    $scope.getProjectData = function(query, append){
      $scope.projectLoading = true;
      Project.get(query, function(result){
        if(resultHandler.process(result)){
          $scope.projectLoading = false;
          if(result.data && result.data.length > 0){

            if(append && append==true){
              $scope.projects = $scope.projects.concat(result.data);
            }
            else{
              $scope.projects = result.data;
            }
            Views.get({entityId:result.data[0]._id}, function(result){
              console.log(result);
              if(resultHandler.process(result)){
                $scope.projects[0].views = result.count;
              }
            });
            $rootScope.headTitle = $scope.projects[0].title + ": Qlik Branch Projects";
            $rootScope.metaKeys = $scope.projects[0].tags + ", Open Source, Github, Projects, QAP, Qlik Analytics Platform";
            $rootScope.metaDesc = $scope.projects[0].short_description;
            if ($scope.projects[0].image != null && $scope.projects[0].image != "") {
              $rootScope.metaImage = $scope.projects[0].image;
              if($rootScope.metaImage.substr(0,2) === "//")
                $rootScope.metaImage = "http:" + $rootScope.metaImage
            }

          }
          else{
            window.location = "#!noitem";
          }
          if($stateParams.status){
            if($stateParams.status=='created'){
              notifications.notify("Your project has been successfully submitted for approval.", null, {sentiment:"positive"});
            }
            else if ($stateParams.status=='updated') {
              notifications.notify("Your project has been successfully updated. It may take up to 5 minutes for the listing page to reflect these changes.", null, {sentiment:"positive"});
            }
          }
          //need to check this!
          $scope.projects.forEach(function(item, index) {
            if (item.votenum > 0) {
              var length = Math.round(item.votetotal/item.votenum)
              $scope.projects[index].stars = new Array(length)
            }
          })

          $scope.projectInfo = result;
          delete $scope.projectInfo["data"];

          $scope.getProductVersions($scope.projects[0].product);

        }
      });
    };

    $scope.getRating = function(total, count){
      if(count && count > 0){
        return Math.round(parseInt(total) / parseInt(count));
      }
      else{
        return 0;
      }
      };

    $scope.updateProjectData = function(query) {
      Project.save(query, function(result){
        if(resultHandler.process(result)) {

        }
      })
    }

    $scope.saveRating = function(rating) {
      Rating.save(rating, function(result) {
        if(resultHandler.process(result)) {

        }
      })
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
        //return $scope.projects[0].content;
      }
    };

    $scope.applySort = function(){
      window.location = "#!project?sort=" + $scope.sort.id + "&product=" + $scope.productId + "&category=" + $scope.categoryId;
    };

    $scope.getAllGitProjects = function(gituser, gitpassword, code) {
      $scope.gitCreds = {
        user: gituser,
        password: gitpassword,
        code: code
      };
      $scope.getGitProjects($scope.gitCreds);
    };

    $scope.getGitProjects = function(params){
      $scope.gitLoading = true;
      $scope.gitError = null;

      Git.save({path:"projects"}, params, function(result){
        console.log(result);
        if(resultHandler.process(result)){
          $scope.gitAuthenticated = true;
          console.log(result);
          if(result.status=="2fa"){
            console.log('need 2fa');
            $scope.is2fa = true;
          }
          else{
            $scope.gitProjects = result.repos;
          }
          $scope.gitLoading = false;
        }
        else{
          $scope.gitAuthenticated = $scope.userManager.userInfo.linked_to_github;
          var msg;
          try{
            var msg = JSON.parse(result.errText);
            $scope.gitError = msg.message;
          }
          catch(err){
            $scope.gitError = result.errText;
          }
          $scope.gitLoading = false;
        }
      });
    };

    $scope.searchGithub = function(githubSearch) {
      var gitParams = angular.copy($scope.gitCreds);
      gitParams.search = githubSearch;
      $scope.getGitProjects(gitParams);
    };

    $scope.selectGitProject = function(project){
      $scope.projects[0].project_site = project.html_url;
      $scope.projects[0].git_clone_url = project.clone_url;
      $scope.projects[0].git_repo = project.name;
      $scope.projects[0].git_user = project.owner.login;
      $scope.projects[0].download_link = "https://github.com/"+project.owner.login+"/"+project.name+"/zipball/master";
    };

    $scope.checkIfVersionChecked = function(version){
      if($scope.projects[0] && $scope.projects[0].productversions){
        return $scope.projects[0].productversions.indexOf(version)!=-1;
      }
      else {
        return false;
      }
    };

    $scope.previewThumbnail = function(){
      $scope.dirtyThumbnail = true;
      var file = $("#thumbnail")[0].files[0];
      var imageName = file.name;
      var imageType = file.type;
      var r = new FileReader();
      r.onloadend = function(event){
        var imageCanvas = document.createElement('canvas');
        var imageContext = imageCanvas.getContext('2d');
        var thumbnailCanvas = document.createElement('canvas');
        var thumbnailContext = thumbnailCanvas.getContext('2d');
        var thumbnail = new Image();
        thumbnail.onload = function() {
          var width = thumbnail.width;
          var height = thumbnail.height;
          imageCanvas.width = width;
          imageCanvas.height = height;
          thumbnailCanvas.width = (width * (77/height));
          thumbnailCanvas.height = 77;

          //draw the image and save the blob
          imageContext.drawImage(thumbnail, 0, 0, imageCanvas.width, imageCanvas.height);
          $scope.image = {
            type: imageType,
            name: imageName,
            data: imageCanvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "")
          }

          //draw the thumbnail and save the blob
          thumbnailContext.drawImage(thumbnail, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
          $scope.thumbnail = {
            type: imageType,
            name: imageName,
            data: thumbnailCanvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "")
          }
          $scope.$apply(function(){
            $scope.projects[0].thumbnail = thumbnailCanvas.toDataURL();
          });
        };
        thumbnail.src = r.result;
      }
      r.readAsDataURL(file);
    };

    $scope.validateNewProjectData = function(){
      //We're validating client side so that we don't keep passing image data back and forth
      //Some of these errors shouldnt occur becuase of the html5 'required' attribute but just in case...
      var errors = [];
      //Verify the project has a name
      if(!$scope.projects[0].title || $scope.projects[0].title==""){
        //add to validation error list
        errors.push("Please specify a Name");
      }
      if(!$scope.projects[0].short_description || $scope.projects[0].short_description==""){
        //add to validation error list
        errors.push("Please add a Short Description");
      }
      //Make sure the Project type has been set
      if(!$scope.projects[0].category){
        //add to validation error list
        errors.push("Please select a Project Type");
      }
      //Make sure the Project status has been set
      if(!$scope.projects[0].status){
        //add to validation error list
        errors.push("Please select a Project Status");
      }
      //Make sure the product has been set
      if(!$scope.projects[0].product){
        //add to validation error list
        errors.push("Please select a Product");
      }
      //Make sure at least one version has been set
      if($scope.projects[0].product && $(".product-version:checkbox:checked").length==0){
        //add to validation error list
        errors.push("Please specify at least one Product Version");
      }
      //If git is being used make sure a project has been selected
      if($scope.isNew && !$scope.projects[0].git_repo){
        //add to validation error list
        errors.push("Please select a Git project to use");
      }
      //If git is NOT being used make sure some content has been provided
      if($scope.usegit=='false' && !$("#newProjectContent").code()){
        //add to validation error list
        errors.push("Please add some content to the project (e.g. documentation, installation instructions).");
      }
      //If there are errors we need to notify the user
      if(errors.length > 0){
        //show the errors
        notifications.notify("The project could not be saved. Please review the following...", errors, {sentiment: "warning"});
        window.scrollTo(100,0);
      }
      else{
        //Save the record
        $scope.saveNewProject();
      }
    };

    $scope.saveNewProject = function(){
      var versions = [];
      $scope.projectLoading = true;
      $(".product-version:checkbox:checked").each(function(index, val){
        versions.push($(this).attr("data-versionid"));
        if(index==$(".product-version:checkbox:checked").length - 1){
          $scope.projects[0].productversions = versions;
        }
      });
      var data = {
        standard: $scope.projects[0]  //data that we can just assign to the project
      }
      if($scope.dirtyThumbnail){
        data.special = { //that will be used to set additional properties
          image: $scope.image,
          thumbnail: $scope.thumbnail
        }
      }
      var query = {};
      if($scope.projects[0]._id){
        query.projectId = $scope.projects[0]._id;
      }
      Project.save(query, data, function(result){
        $scope.projectLoading = false;
        if(resultHandler.process(result)){
          var status = $scope.isNew ? "created" : "updated";
          window.location = "#!project/"+result._id+"?status="+status;
        }
        else{
          notifications.notify(result.errText, null, {sentiment: "negative"});
        }
      });
    };

    $scope.search = function(){
      searchExchange.clear();
      $scope.searching = true;
    };

    $scope.browse = function(){
      searchExchange.clear();
      $scope.searching = false;
    };

    $scope.clear = function(){
      searchExchange.clear();
    };

    $scope.removedefaultSelection = function(field){
      for(var i=0;i<defaultSelection.length;i++){
        if(defaultSelection[i].field==field){
          defaultSelection.splice(i,1);
        }
      }
    };

    $scope.filterProduct = function(product){
      $scope.removedefaultSelection('product');
      if(product=="QlikView"){
        if($(".qlikview-filter").hasClass('active')){
          $(".qlikview-filter").removeClass('active');
        }
        else{
          $(".qlikview-filter").addClass('active');
          $scope.addDefaultSelection('product', [{qText: product}]);
        }
        $(".qlik-sense-filter").removeClass('active');
      }
      else {
        if($(".qlik-sense-filter").hasClass('active')){
          $(".qlik-sense-filter").removeClass('active');
        }
        else{
          $(".qlik-sense-filter").addClass('active');
          $scope.addDefaultSelection('product', [{qText: product}]);
        }
        $(".qlikview-filter").removeClass('active');
      }
      searchExchange.subscribe('reset', "projects", function(){
        searchExchange.init(defaultSelection);
        searchExchange.unsubscribe('reset', "projects");
      });
      searchExchange.clear(true);
    };

    $scope.addDefaultSelection = function(field, values){
      defaultSelection.push({
        field: field,
        values: values
      });
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
      //only load the project if we have a valid projectId or we are in list view
      if($state.current.name=="projects.detail"){
        $scope.getProjectData($scope.query); //get initial data set
        userManager.refresh(function(hasUser){
          $scope.currentuserid = userManager.userInfo._id;
        });
      }
      else if($state.current.name=="projects.addedit"){
        picklistService.getPicklistItems("Product", function(items){
          $scope.projectProducts = items;
        });
        picklistService.getPicklistItems("Category", function(items){
          $scope.projectCategories = items;
        });
        picklistService.getPicklistItems("Project Status", function(items){
          $scope.projectStatuses = items;
        });
        if($stateParams.projectId=="new"){
          $scope.projects = [{}];
        }
        var hasUser = userManager.hasUser();
        if(!hasUser){
          userManager.refresh(function(hasUser){
            if(!hasUser){
              window.location = "#!login?url=project/"+$stateParams.projectId+"/edit"
            }
            else{
              if($stateParams.projectId!="new"){
                $scope.getProjectData($scope.query); //get initial data set
              }
              else{
                if(userManager.userInfo.linked_to_github==true){
                  $scope.getAllGitProjects();
                }
              }
            }
          });
        }
        else{
          if($stateParams.projectId!="new"){
            $scope.getProjectData($scope.query); //get initial data set
          }
          else{
            if(userManager.userInfo.linked_to_github==true){
              $scope.getAllGitProjects();
            }
          }
        }
      }
      else{ //this should be the list page
        //if(fromState.name.split(".")[0]!=toState.name.split(".")[0]){  //the entity has changed so we re-initialise the search defaults
          if(!userManager.hasUser()){
            userManager.refresh(function(hasUser){
              if(!hasUser){
                defaultSelection = [{
                  field: "approved",
                  values: [{qText: "True"}]
                }]
              }
              else{
                if(!userManager.canApprove('project')){
                  defaultSelection = [{
                    field: "approved",
                    values: [{qText: "True"}]
                  }]
                }
              }
              //searchExchange.init(defaultSelection);
              searchExchange.subscribe('reset', "projects", function(){
                searchExchange.init(defaultSelection);
                searchExchange.unsubscribe('reset', "projects");
              });
              if((fromState.name.split(".")[0]!=toState.name.split(".")[0]) || fromState.name=="loginsignup"){
                searchExchange.clear(true);
              }
            });
          }
          else{
            if(!userManager.canApprove('project')){
              defaultSelection = [{
                field: "approved",
                values: [{qText: "True"}]
              }]
            }
            //searchExchange.init(defaultSelection);
            searchExchange.subscribe('reset', "projects", function(){
              searchExchange.init(defaultSelection);
              searchExchange.unsubscribe('reset', "projects");
            });
            if((fromState.name.split(".")[0]!=toState.name.split(".")[0]) || fromState.name=="loginsignup"){
              searchExchange.clear(true);
            }
          }

      }
    });

  }]);

  app.controller("blogController", ["$rootScope","$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "notifications", "picklistService", function ($rootScope, $scope, $resource, $state, $stateParams, userManager, resultHandler, notifications, picklistService) {
      var Blog = $resource("api/blog/:blogId", { blogId: "@blogId" });
      var ImageAPI = $resource("api/resource/image/:url", {url: "@url"});

      $scope.pageSize = 20;
      $scope.query = {};
      $scope.simplemde;
      
      
      $scope.blogLoading = $stateParams.blogId != "new";

      $scope.isNew = $stateParams.blogId == "new";

      $scope.dirtyThumbnail = false;

      var defaultSelection;

      $scope.blogTypes;

      $rootScope.bucket;

      $resource("api/bucket").get({}, function(result) {
          $rootScope.bucket = result.bucket;
      });

      $rootScope.headTitle = "Blog: Qlik Branch";
      $rootScope.metaKeys = "Branch, Qlik Branch, Blog, Articles, Updates, News, Qlik Sense, Qlik, Open Source";
      $rootScope.metaDesc = "The Qlik Branch Blog is a place for developers to read helpful and interesting articles about using our APIs as well as news and communications about anything relevant to developers."
      $rootScope.metaImage = "http://branch.qlik.com/resources/branch_logo.png";
    

      if ($stateParams.blogId) {
          $scope.query.blogId = $stateParams.blogId;
          $scope.blogId = $stateParams.blogId;
      }

      picklistService.getPicklistItems("Blog Type", function (items) {
          $scope.blogTypes = items;
          $scope.newBlogType = items[0];
      });

      $scope.getBlogData = function (query, append) {
          Blog.get(query, function (result) {
              $scope.blogLoading = false;
              if (resultHandler.process(result)) {
                  if (result.data && result.data.length > 0) {
                      if ($stateParams.status) {
                          if ($stateParams.status == 'created') {
                              notifications.notify("Your blog post has been successfully submitted for approval.", null, { sentiment: "positive" });
                          }
                          else if ($stateParams.status == 'updated') {
                              notifications.notify("Your blog post has been successfully updated. It may take up to 5 minutes for the listing page to reflect these changes.", null, { sentiment: "positive" });
                          }
                      }
                      if (append && append == true) {
                          $scope.blogs = $scope.blogs.concat(result.data);
                      }
                      else {
                          $scope.blogs = result.data;
                      }
                      if ($state.current.name == "blogs.addedit") {
                          $scope.simplemde.value(_arrayBufferToBase64(result.data[0].content.data));
                      }
                      $rootScope.headTitle = result.data[0].title + " : Qlik Branch Blog";
                      $rootScope.metaKeys = result.data[0].tags + ", Branch, Qlik Branch, Blog, Articles, Updates, News, Qlik Sense, Qlik, Open Source";
                      $rootScope.metaDesc = result.data[0].short_description + " : Qlik Branch Blog";
                      if ($scope.blogs[0].image != null && $scope.blogs[0].image != "") {
                          $rootScope.metaImage = $scope.blogs[0].image;
                          if($rootScope.metaImage.substr(0,2) === "//")
                              $rootScope.metaImage = "http:" + $rootScope.metaImage
                      }
                  
                      $scope.blogInfo = result;
                      delete $scope.blogInfo["data"];
                  }
                  else {
                      window.location = "#!noitem";
                  }
              }
          });
      };

      $scope.previewThumbnail = function () {
          $scope.dirtyThumbnail = true;
          var file = $("#blogImage")[0].files[0];
          var imageName = file.name;
          var imageType = file.type;
          var r = new FileReader();
          r.onloadend = function (event) {
              var imageCanvas = document.createElement('canvas');
              var imageContext = imageCanvas.getContext('2d');
              var thumbnailCanvas = document.createElement('canvas');
              var thumbnailContext = thumbnailCanvas.getContext('2d');
              var thumbnail = new Image();
              thumbnail.onload = function () {
                  var width = thumbnail.width;
                  var height = thumbnail.height;
                  imageCanvas.width = width;
                  imageCanvas.height = height;
                  thumbnailCanvas.width = (width * (77 / height));
                  thumbnailCanvas.height = 77;

                  //draw the image and save the blob
                  imageContext.drawImage(thumbnail, 0, 0, imageCanvas.width, imageCanvas.height);
                  $scope.image = {
                      type: imageType,
                      name: imageName,
                      data: imageCanvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "")
                  }

                  //draw the thumbnail and save the blob
                  thumbnailContext.drawImage(thumbnail, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
                  $scope.thumbnail = {
                      type: imageType,
                      name: imageName,
                      data: thumbnailCanvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "")
                  }
                  $scope.$apply(function () {
                      $scope.blogs[0].thumbnail = thumbnailCanvas.toDataURL();
                  });
              };
              thumbnail.src = r.result;
          }
          r.readAsDataURL(file);
      };

      $scope.validateNewBlogData = function () {
          //We're validating client side so that we don't keep passing image data back and forth
          //Some of these errors shouldnt occur becuase of the html5 'required' attribute but just in case...
          var errors = [];
          //Verify the blog has a name
          if (!$scope.blogs[0].title || $scope.blogs[0].title == "") {
              errors.push("Please specify a title");
          }
          if (!$scope.blogs[0].short_description || $scope.blogs[0].short_description == "") {
              errors.push("Please specify a short description");
          }
          //Verify the blog has a type
          if (!$scope.blogs[0].blogType) {
              errors.push("Please select a Type");
          }
          //Verify the blog has content
          if ($scope.simplemde.value().length == 0 || $scope.simplemde.value().length == 12) {  //this is not necessarily robust. a length of 12 appears to be an empty input
              errors.push("Please add some content");
          }
          //If there are errors we need to notify the user
          if (errors.length > 0) {
              //show the errors
              notifications.notify("The blog post could not be saved. Please review the following...", errors, { sentiment: "warning" });
              window.scrollTo(100, 0);
          }
          else {
              //Save the record
              $scope.saveBlog();
          }
      };

      $scope.saveBlog = function () {
          $scope.blogLoading = true;
          $scope.blogs[0].content = $scope.simplemde.value();
          $scope.blogs[0].plaintext = cleanUpContent($scope.blogs[0].content);
          var data = {
              standard: $scope.blogs[0],
              special: {
                markdown: true
              }
          };
          if ($scope.dirtyThumbnail) {
              data.special.image = $scope.image;
              data.special.thumbnail = $scope.thumbnail;
          }
          var query = {};
          if ($scope.blogs[0]._id) {
              query.blogId = $scope.blogs[0]._id;
          }
          Blog.save(query, data, function (result) {
              $scope.blogLoading = false;
              if (resultHandler.process(result)) {
                  var status = $scope.isNew ? "created" : "updated";
                  window.location = "#!blog/" + result._id + "?status=" + status;
              }
              else {
                  notifications.notify(result.errText, null, { sentiment: "negative" });
              }
          });
      };

      $scope.getBlogContent = function (text) {
          if (text && text.data) {
              var buffer = _arrayBufferToBase64(text.data);
              return marked(buffer);
          }
          else {
              return "";
          }
      };

      $scope.addImageToMarkdown = function(url) {
          var imageContent = "![](" + url + ")";
          $scope.simplemde.codemirror.replaceSelection(imageContent);
      };

      $scope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
          if (fromState.name.split(".")[0] == toState.name.split(".")[0]) { //then we should clear the search state
              if (toState.name.split(".").length == 1) { //we only need to do this if we're on a listing page
                  searchExchange.publish("executeSearch");
              }
          }
          if (toState.name != "loginsignup") {
              searchExchange.view = toState.name.split(".")[0];
          }
          if ((fromState.name.split(".")[0] != toState.name.split(".")[0]) || fromState.name == "loginsignup") {
              searchExchange.clear(true);
          }
          defaultSelection = [];
          if ($state.current.name == "blogs.detail") {
              $scope.getBlogData($scope.query); //get initial data set
              userManager.refresh(function (hasUser) {
                  $scope.currentuserid = userManager.userInfo._id;
              });
          }
          else if ($state.current.name == "blogs.addedit") {
              $scope.simplemde = new SimpleMDE({ element: $("#blogContent")[0],
                  placeholder: "Blogs content uses markdown. If you would like to add an image to your markdown you can upload the image below, then click the image to add." });

              var dropzone = new Dropzone('#blogImages', {
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
                  ImageAPI.delete({url: file.url}, function(response) {
                      console.log("Removed", file.url);
                  });
              });

              picklistService.getPicklistItems("Blog Type", function (items) {
                  $scope.blogTypes = items;
              });
              if ($stateParams.blogId == "new") {
                  $scope.blogs = [{}];
              }
              var hasUser = userManager.hasUser();
              if (!hasUser) {
                  userManager.refresh(function (hasUser) {
                      if (!hasUser) {
                          window.location = "#!login?url=blog/" + $stateParams.blogId + "/edit"
                      }
                      else {
                          if ($stateParams.blogId != "new") {
                              $scope.getBlogData($scope.query); //get initial data set
                          }
                      }
                  });
              }
              else {
                  if ($stateParams.blogId != "new") {
                      $scope.getBlogData($scope.query); //get initial data set
                  }
              }
          }
          else { //this should be the list page
              if (!userManager.hasUser()) {
                  userManager.refresh(function (hasUser) {
                      if (!hasUser) {
                          defaultSelection = [{
                              field: "approved",
                              values: [{ qText: "True" }]
                          }]
                      }
                      else {
                          if (!userManager.canApprove('blog')) {
                              defaultSelection = [{
                                  field: "approved",
                                  values: [{ qText: "True" }]
                              }]
                          }
                      }
                      searchExchange.subscribe('reset', "blogs", function () {
                          searchExchange.init(defaultSelection);
                          searchExchange.unsubscribe('reset', "blogs");
                      });
                      if ((fromState.name.split(".")[0] != toState.name.split(".")[0]) || fromState.name == "loginsignup") {
                          searchExchange.clear(true);
                      }
                  });
              }
              else {
                  if (!userManager.canApprove('blog')) {
                      defaultSelection = [{
                          field: "approved",
                          values: [{ qText: "True" }]
                      }]
                  }
                  searchExchange.subscribe('reset', "blogs", function () {
                      searchExchange.init(defaultSelection);
                      searchExchange.unsubscribe('reset', "blogs");
                  });
                  if ((fromState.name.split(".")[0] != toState.name.split(".")[0]) || fromState.name == "loginsignup") {
                      searchExchange.clear(true);
                  }
              }
          }
      });

      function _arrayBufferToBase64(buffer) {
          var binary = '';
          var bytes = new Uint8Array(buffer);
          var len = bytes.byteLength;
          for (var i = 0; i < len; i++) {
              binary += String.fromCharCode(bytes[i]);
          }
          return binary;
      }

      function cleanUpContent(text) {
          var noImg = text.replace(/<img[^>]*>/g, "[image]");
          noHTML = noImg.replace(/<\/?[^>]+(>|$)/g, "");
          return noHTML;
      }

  }]);

  app.controller("resourceController", ["$rootScope","$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "notifications", "picklistService", function($rootScope, $scope, $resource, $state, $stateParams, userManager, resultHandler, notifications, picklistService){
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
      //Verify the blog has a name
      if(!$scope.resources[0].title || $scope.resources[0].title==""){
        errors.push("Please specify a title");
      }
      //Verify the blog has a type
      if(!$scope.resources[0].resourceType){
        errors.push("Please select a Type");
      }
      //Verify the blog has content
      if($scope.simplemde.value().length==0 || $scope.simplemde.value().length==12){  //this is not necessarily robust. a length of 12 appears to be an empty input
        errors.push("Please add some content");
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
        return marked(buffer);
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

  app.controller("commentController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", function($scope, $resource, $state, $stateParams, userManager, resultHandler){
    var Comment = $resource("api/comment/:commentId", {commentId: "@commentId"});
    var Entity = $resource("api/"+$scope.entity+"/"+$scope.entityid+"/:path", {path: "@path"});

    $scope.userManager = userManager;

    $scope.simplemde = new SimpleMDE({ element: $("#commentContent")[0], placeholder: "Post a comment here." });

    $scope.comments = [];
    $scope.pageSize = 10;

    $scope.sortOptions = {
      newest: {
        id: "newest",
        name: "Newest",
        order: -1,
        field: "createdate"
      },
      oldest: {
        id: "oldest",
        name: "Oldest",
        order: 1,
        field: "createdate"
      }
    };

    $scope.getFlagged = function(){
      Comment.get({commentId: "flagged", entityId: $scope.entityid}, {
        limit: 100  //if we have more than 100 flagged items we have some housekeeping to do
      }, function(result){
        if(resultHandler.process(result)){
          //$scope.flagged = result.data;
          if(result.data){
            for(var i=0;i<result.data.length;i++){
              $scope.flagged[result.data[i].entityId] = true;
            }
          }
        }
      });
    };

    $scope.getFlagged();

    $scope.isFlagged = function(id){
      if($scope.flagged){
        for(var i=0;i<$scope.flagged.length;i++){
          if($scope.flagged[i].entityId == id){
            return true;
          }
        }
        return false;
      }
      return false;
    };

    $scope.commentQuery = {
      limit: $scope.pageSize //overrides the server side setting
    };

    $scope.applySort = function(sort){
      $scope.commentQuery.sort = sort.field;
      $scope.commentQuery.sortOrder = sort.order;
      $scope.getCommentData($scope.commentQuery);
    };

    $scope.sort = $scope.sortOptions.newest;
    $scope.commentQuery.sort = $scope.sort.field;
    $scope.commentQuery.sortOrder = $scope.sort.order;


    $scope.$on("listItemDeleted", function(event, params){
      for(var i=0;i<$scope.comments.length;i++){
        if($scope.comments[i]._id==params){
          $scope.comments.splice(i,1);
        }
      }
    });


    $scope.getCommentData = function(query, append){
      Comment.get(query, function(result){
        if(resultHandler.process(result, null, true)){
          if(append && append==true){
            $scope.comments = $scope.comments.concat(result.data);
          }
          else{
            $scope.comments = result.data;
          }
          $scope.commentInfo = result;
          delete $scope.commentInfo["data"];
        }
      });
    };

    if($scope.entityid){
      $scope.commentQuery.entityId = $scope.entityid;
      $scope.url = $scope.entity + "/" + $scope.entityId;
      $scope.getCommentData($scope.commentQuery);
    }

    $scope.getCommentText = function(text){
      if(text && text.data){
        var buffer = _arrayBufferToBase64(text.data);
        return marked(buffer);
      }
      else{
        return "";
      }
    }

    $scope.saveComment = function(){
      var commentText = $scope.simplemde.value();
      var data = {
        standard: {
          entityId: $scope.entityid,
          entity: $scope.entity,
          content: commentText,
          plaintext: cleanUpComment(commentText)
        },
        special: {
          content: commentText
        }
      };
      Comment.save({}, data, function(result){
        if(resultHandler.process(result)){
          $scope.simplemde.value("");
          //fetch the comments again to resolve any sorting/countnig issues
          $scope.getCommentData($scope.commentQuery);
        }
      })
    };

    $scope.more = function(){
      $scope.commentQuery.skip = $scope.comments.length;
      $scope.getCommentData($scope.commentQuery, true);
    };

    function bin2String(array) {
      return String.fromCharCode.apply(String, array);
    }

    function _arrayBufferToBase64( buffer ) {
      var binary = '';
      var bytes = new Uint8Array( buffer );
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
          binary += String.fromCharCode( bytes[ i ] );
      }
      return binary ;
    }

    function cleanUpComment(commentText){
      var noImg = commentText.replace(/<img[^>]*>/g,"[image]");
      noHTML = noImg.replace(/<\/?[^>]+(>|$)/g, "");
      return noHTML;
    }


  }]);

  app.controller("userController", ["$rootScope","$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "notifications", function($rootScope, $scope, $resource, $state, $stateParams, userManager, resultHandler, notifications){
    var User = $resource("api/userprofile/:userId", {userId: "@userId"});
    var UserRoles = $resource("api/userrole/:roleId", {roleId: "@roleId"});
    var Project = $resource("api/project/:projectId", {projectId: "@projectId"});
    var Blog = $resource("api/blog/:blogId", {projectId: "@blogId"});
    var ChangePassword = $resource("auth/change");

    $scope.query = {};
    $scope.projectCount = 0;

    $scope.userLoading = true;
    $scope.userManager = userManager;
    var defaultSelection = [];

    UserRoles.get({}, function(result){
      if(resultHandler.process(result)){
        $scope.roles = result.data;
        $scope.roleInfo = result;
        
        delete $scope.roleInfo["data"];      
      }
    });

    if($stateParams.userId){
      $scope.query.userId = $stateParams.userId;
      Project.get({projectId:'count', userid: $stateParams.userId}, function(result){
        if(resultHandler.process(result)){
          $scope.projectCount = result.count;
        }
      });
      Blog.get({blogId:'count', userid: $stateParams.userId}, function(result){
        if(resultHandler.process(result)){
          $scope.blogCount = result.count;
        }
      });
    }

    $scope.changePassword = function(){
      ChangePassword.save({
        oldPassword: $scope.oldpassword,
        password: $scope.password
      }, function(result){
        if(resultHandler.process(result)){
          $scope.oldpassword = "";
          $scope.password = "";
          $scope.confirm = "";
          notifications.notify("Your password was successfully changed. ", null, {sentiment: 'positive'});
        }
        else{
          notifications.notify(result.errText, null, {sentiment: 'negative'});
        }
      });
    };

    $scope.getUserData = function(query, append){
      User.get(query, function(result){
        $scope.userLoading = false;
        if(resultHandler.process(result)){
          if(append && append==true){
            $scope.users = $scope.users.concat(result.data);
          }
          else{
            $scope.users = result.data;
          }
          $scope.userInfo = result;
          console.log(result.data);
          $rootScope.headTitle = result.data[0].username + " : Qlik Branch Users";
          $rootScope.metaKeys = "Branch, Qlik Branch, Qlik Sense, Qlik, Open Source, Github, Projects, Extensions, Mash-ups, API, QAP, Qlik Analytics Platform";
          $rootScope.metaDesc = "Qlik Branch integrates with Github to host open source projects leveraging Qlik's extensibility and APIs.  Find code to use as a foundation for your next project, share your work, or get inspired."
          $rootScope.metaImage = "http://branch.qlik.com/resources/branch_logo.png";
          
          //$scope.setTab(0);
          delete $scope.userInfo["data"];
        }
      });
    };

    $scope.activeTab = 0;
    $scope.firstLoad = true;

    $scope.setTab = function(index){
      $scope.activeTab = index;
      if(!$scope.firstLoad){
        searchExchange.clear();
      }
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
      if(toState.name=="users" || toState.name=="users.detail"){
        userManager.refresh(function(hasUser){
          if(!hasUser){
            defaultSelection.push({
              field: "approved",
              values: [{qText: "True"}]
            });
          }
          else{
            if(!userManager.canApprove('project') && userManager.userInfo._id!=$stateParams.userId){
              defaultSelection.push({
                field: "approved",
                values: [{qText: "True"}]
              });
            }
          }
          defaultSelection.push({
            field: "userId",
            values: [{qText: $stateParams.userId}]
          });
          searchExchange.subscribe('reset', "users", function(){
            searchExchange.init(defaultSelection);
            searchExchange.unsubscribe('reset', "users");
          });
          $scope.firstLoad = false;
        });
        $scope.getUserData($scope.query);
      }
      else if(toState.name=="users.addedit" || toState.name=="userprofiles.addedit"){
        //need to implement edit stuff
        userManager.refresh(function(hasUser){
          if(!hasUser){
            window.location = "#!login?url=user/"+$stateParams.userId+"/edit"
          }
          else{
            if($stateParams.userId!="new"){
              $scope.getUserData($scope.query);
            }
          }
        });
      }
      else{
        //shouldn't reach here

      }
    });

    $scope.previewThumbnail = function(){
      $scope.dirtyThumbnail = true;
      var file = $("#userImage")[0].files[0];
      var imageName = file.name;
      var imageType = file.type;
      var r = new FileReader();
      r.onloadend = function(event){
        var imageCanvas = document.createElement('canvas');
        var imageContext = imageCanvas.getContext('2d');
        var thumbnailCanvas = document.createElement('canvas');
        var thumbnailContext = thumbnailCanvas.getContext('2d');
        var thumbnail = new Image();
        thumbnail.onload = function() {
          var width = thumbnail.width;
          var height = thumbnail.height;
          imageCanvas.width = width;
          imageCanvas.height = height;
          thumbnailCanvas.width = (width * (77/height));
          thumbnailCanvas.height = 77;

          //draw the image and save the blob
          imageContext.drawImage(thumbnail, 0, 0, imageCanvas.width, imageCanvas.height);
          $scope.image = {
            type: imageType,
            name: imageName,
            data: imageCanvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "")
          }

          //draw the thumbnail and save the blob
          thumbnailContext.drawImage(thumbnail, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
          $scope.thumbnail = {
            type: imageType,
            name: imageName,
            data: thumbnailCanvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "")
          }
          $scope.$apply(function(){
            $scope.users[0].thumbnail = thumbnailCanvas.toDataURL();
          });
        };
        thumbnail.src = r.result;
      }
      r.readAsDataURL(file);
    };

    $scope.validateNewUserData = function(){
      //We're validating client side so that we don't keep passing image data back and forth
      //Some of these errors shouldnt occur becuase of the html5 'required' attribute but just in case...
      var errors = [];
      //Verify the project has a name
      if(!$scope.users[0].fullname || $scope.users[0].fullname==""){
        errors.push("Please tell us your name");
      }
      //If there are errors we need to notify the user
      if(errors.length > 0){
        //show the errors
        notifications.notify("The user could not be saved. Please review the following...", errors, {sentiment: "warning"});
        window.scrollTo(100,0);
      }
      else{
        //Save the record
        $scope.saveUser();
      }
    };

    $scope.saveUser = function(){
      $scope.userLoading = true;
      var data = {
        standard: $scope.users[0]
      };
      if($scope.dirtyThumbnail){
        data.special = {
          image: $scope.image,
          thumbnail: $scope.thumbnail
        }
      }
      var query = {};
      if($scope.users[0]._id){
        query.userId = $scope.users[0]._id;
      }
      User.save(query, data, function(result){
        $scope.userLoading = false;
        if(resultHandler.process(result)){
          var status = $scope.isNew ? "created" : "updated";
          window.location = "#!user/"+result._id+"?status="+status;
        }
        else{
          notifications.notify(result.errText, null, {sentiment: "negative"});
        }
      });
    };

  }]);

  app.controller("moderationController", ["$scope", "$rootScope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "confirm", function($scope, $rootScope, $resource, $state, $stateParams, userManager, resultHandler, confirm, title){
    var Entity = $resource("/api/"+$scope.entity+"/:entityId/:function", {entityId: "@entityId", function: "@function"});
    var GitReadme = $resource("/git/updatereadme/:projectId", {projectId: "@projectId"});  //currently only applies to projects

    $scope.userManager = userManager;

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
      window.location = "#!"+$scope.entity+"/"+$scope.entityid+"/edit";
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
                  window.location = "#!"+$scope.entity;
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
  }]);

  //return app
//})();

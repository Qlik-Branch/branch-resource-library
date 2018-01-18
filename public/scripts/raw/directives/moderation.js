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
				entityuri: "=",
        entityid: "=",
				owner: "=",
				approved: "=",
				flagged: "=",
				flagcount: "=",
				editable: "=",
				download: "=",
				size: "=",
				orientation: "=",
				entityObject: "="
			},
      templateUrl: "/views/moderation.html",
      controller: "moderationController"
    }
  }]);

	return module;
}));

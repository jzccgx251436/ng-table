var App = angular.module('demo', ['classy']);

App.classy.controller({
  name: 'TableCtrl',
  inject: ['$scope', 'tableService'],
  init: function() {
    console.log('o')
  }
})

App.service('tableService', function() {
  //var 
  return {
    get: function() {}
  }
})

App.directive('ngTableData', function() {
  return {
    restrict: 'E',
    transclude: true,
    controller: App.classy.controller({
      inject: ['$scope', '$element', '$attrs', 'tableService'],
      init: function() {
        console.log('stuff')
      }
    }),
    template: '<div ng-transclude></div>'
  }
})

App.directive('ngTable', function() {
  return {
    restrict: 'E',
    transclude: true,
    controller: App.classy.controller({
      inject: ['$scope', '$element', '$attrs', 'tableService'],
      init: function() {
        console.log('stuffs')
        this.$.worked = "true";
      }
    }),
    template: '<table class="ng-table" ng-transclude></table>'
  }
})

// App.directive('ng-table', function() {
//   return function(scope, elem, attrs) {
//     console.log(elem)
//   }
// })

// angular.module('demo.directives', []).directive('ngTable', function() {
//   return {
//     restrict: 'E',
//     link: function(s,e,a) {
//       console.log(e)
//     },
//     controller: function(s,e,a) {
//       console.log(e)
//     }
//   }
// })
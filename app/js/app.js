var App = angular.module('demo', ['classy']);

App.classy.controller({
  name: 'TableCtrl',
  inject: ['$scope', 'tableService'],
  init: function() {
    this.$.stuff = 'cow'
    console.log(this.$.filterInput)    
  }
})

App.service('tableService', function() {
  var _dataTables = {};

  return {
    get: function(key) {
      return _dataTables[key]
    },
    set: function(key, val) {
      _dataTables[key] = val;
    },
    keys: function() {
      return Object.keys(_dataTables);
    }
  }
})

App.service('dataService', ['$location', '$q', '$http', function($location, $q, $http) {  

  return {
    init: function(inlineData) {
      var d = $q.defer();      

      try {
        var res = JSON.parse(inlineData);
        d.resolve(res);
        return d.promise;
      } catch(e) {
        console.log("no in-line data, trying ajax")

        // $http.get($location.url()).success(function(data) {
        //   d.resolve(data);
        //   return d.promise;
        // })
      }
    }
  }

}])

App.directive('ngTableData', function() {
  return {
    restrict: 'E',
    transclude: true,
    controller: App.classy.controller({
      inject: ['$scope', '$element', '$attrs', '$transclude', 'tableService'],
      init: function() {
        try {
          this.tableService.set(this.$element[0].id, JSON.parse(this.$transclude()[0].textContent))
        } catch(e) {
          console.log('error parsing data: ', e)
        }        
      }
    })
  }
})

App.directive('ngTable', function() {
  return {
    restrict: 'E',
    transclude: true,
    controller: App.classy.controller({
      inject: ['$scope', '$element', '$attrs', '$transclude', '$location','tableService', 'dataService'],
      init: function() {
        this.$.filter = '';
        this.$.stuffy = "pants"
        this.dataService.init(this.$transclude().text()).then(function(data) {
          this.$.data = data;
          this.$.headers = [];
          Object.keys(this.$.data[0]).forEach(function(key) {
            this.$.headers.push({key: key, checked: false})
          }, this)
        }.bind(this))
      }
    }),
    link: function(s,e,a) {
      console.log(s.stuff)
    },
    template: 'Search: <input type="text" ng-model="filter"></input><br>' +
    '<table class="ng-table">' +
      '<thead><tr>' +
        '<th ng-repeat="key in headers"><label>{{key.key}} <input type="checkbox" ng-model="key.checked" /></label></th>' +
      '</tr></thead>' +
      '<tbody>' +
        '<tr ng-repeat="row in data | tableFilter: filter : headers" ngtable-row row="row" headers="headers"></tr>' +
      '</tbody>' + 
    '</table>'
  }
})

App.directive('ngtableRow', function() {
  return {
    restrict: 'A',
    scope: { row: '=', headers: '=' },
    link: function(s,e,a) {      
    },
    template: '<td ng-repeat="key in headers">{{row[key.key]}}</td>'
  }
})

App.filter('tableFilter', function() {
  function getHeaders(headers) {
    var out = [];
    headers.forEach(function(header) {
      if (header.checked)
        out.push(header.key)
    })

    if (!out.length)
      headers.forEach(function(header) { out.push(header.key) })
      
    return out;
  }

  return function(data, filtertxt, headers) {
    this.searchHeaders = getHeaders(headers);

    var out =  data.filter(function(obj) {
      return this.searchHeaders.some(function(header) {
        return obj[header].toString().toLowerCase().indexOf(filtertxt) > -1
      })      
    }, this)

    return out
  }
})
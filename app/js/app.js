var App = angular.module('demo', ['classy']);

App.classy.controller({
  name: 'TableCtrl',
  inject: ['$scope', 'tableService'],
  init: function() {
    console.log('o')
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

App.service('templateService', function() {
  var _templates = {
    table: '<table></table>',
    thead: '<thead></thead>',
    tr: '<tr></tr>',
    th: '<th></th>',
    tbody: '<tbody></tbody>',
    td: '<td></td>'
  };

  return {
    new: function(tag) {
      return angular.element(_templates[tag]);
    }
  }

})

App.factory('tableFactory', ['templateService', function(ts) {

  var fac = function(target) {
    this.dom = {
      table: ts.new('table')
    };    

    ['thead', 'tbody'].forEach(function(key) { 
      this.dom[key] = {};
      this.dom[key].el = this.dom.table.append(ts.new(key));
      this.dom[key].tr = this.dom.table.append(ts.new('tr'));
      this.dom[key].rowcells = [[]];
    }, this);
    
    this.cols = []
    this.rows = []

    target.append(this.dom.table);
  }

  fac.prototype.addCol = function(header) {
    this.dom.thead.rowcells[0].push(ts.new('td').textContent = header);
    this.dom.tbody.rowcells.forEach(function(row) {
      row.push(ts.new('td'))
    },this)
    this.cols.push(header);
  };

  fac.prototype.addRow = function(data) {
    var len = this.dom.tbody.rowcells.push([]);

    data.forEach(function() {
      this.dom.tbody.rowcells[len].push(ts.new('td').textContent = data)
    },this)
  }    

  fac.prototype.addRows = function(len) {
    for (var i=0; i < len; i++) {
      this.dom.tbody.rowcells.push([])
    }
  };

  fac.prototype.setData = function(dataObj) {
    if (dataObj instanceof Array)
      dataObj = dataObj[0];
    
    Object.keys(dataObj).forEach(this.addCol, this)

    var lens = [];
    
    for (var key in dataObj) {
      lens.push(dataObj[key].length);
    }
    this.addRows(Math.max.apply(null, lens))

    for (var key in dataObj) {

    }
  };

  

  return fac;
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
        this.dataService.init(this.$transclude().text()).then(function(data) {
          this.$.data = data;
          this.$.headers = Object.keys(this.$.data[0])
        }.bind(this))
      }
    }),
    template: '<table class="ng-table">' +
      '<thead><tr>' +
        '<th ng-repeat="key in headers">{{key}}</th>' +
      '</tr></thead>' +
      '<tbody>' +
        '<tr ng-repeat="row in data" ng-row></tr>' +
      '</tbody>' + 
    '</table>'
  }
})
App.directive('ngRow', function() {
  return {
    restrict: 'A',    
    controller: App.classy.controller({
      inject: ['$scope', '$element', '$attrs'],
      init: function() {
        this.$.data = [];
        this.$.$parent.headers.forEach(function(key) {
          this.$.data.push(this.$.$parent.data[0][key])
        }, this)
      }
    }),
    template: '<td ng-repeat="key in data track by $index">{{key}}</td>'
  }
})


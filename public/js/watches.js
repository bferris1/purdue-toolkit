angular.module('WatchesPage',[])

.controller('watchListCtrl',function($http){
    this.testing = 'asdffdsa';
    var watchList = this;

    function refreshLists(){
        $http.get('/api/watches').success(function (data) {
            watchList.watches = data;
        });
    }
    refreshLists();



    watchList.deleteWatch = function (id) {
        $http.delete('/api/watches/'+id).success(function(data){
            refreshLists();
        })
    }

});


angular.module('WatchesPage',[])

.controller('watchListCtrl',function($http){
    this.testing = 'asdffdsa';
    var watchList = this;

    function refreshLists(){
        $http.get('/api/watches').then(function onSuccess(response) {
            watchList.watches = response.data;
        });
    }
    refreshLists();



    watchList.deleteWatch = function (id) {
        $http.delete('/api/watches/'+id).then(function onSuccess(response){
            refreshLists();
        })
    }

});


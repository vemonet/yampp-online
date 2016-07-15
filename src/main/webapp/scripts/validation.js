var valueAllBoxes = false;
/**
 * To check or uncheck all validity checkboxes
 */
function checkAllBoxes() {
    var checkboxes = document.getElementsByClassName("checkbox");
    for (var i = checkboxes.length - 1; i >= 0; i--)
    {
      checkboxes[i].checked = valueAllBoxes;
    }
    if (valueAllBoxes == true) {
      valueAllBoxes = false;
    } else {
      valueAllBoxes = true;
    }
}

var validationApp = angular.module('validationApp', []);   

validationApp.controller('validationCtrl', function ($scope, $window) {
  // Init alignmentJson for angular js by getting the alignment from Java alignmentArray
  $scope.alignmentJson = $window.alignmentJson;
  //console.log($scope.alignmentJson);
  
  $scope.greaterThan = function(prop, val){
    /*return function(item){
      return item[prop] > val;
    }*/
    if (prop > val) {
      return true;
    } else {
      return false;
    }
    
}
});

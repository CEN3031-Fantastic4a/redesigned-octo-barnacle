(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

    HomeController.$inject = ['ParkingService', 'NgMap'];

  function HomeController(ParkingService, NgMap) {
    var vm = this;
    vm.spots = ParkingService.query();
    //vm.googleMapsUrl = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAJEoMA7rbgnOKG2ILkLNSaj8XB9zaR3Bo';
    vm.showSpotInfo = function(event, spot){
      vm.selectedCity = spot;
      vm.map.setZoom(18);
      //vm.map.setCenter(new google.maps.LatLng(vm.selectedCity.latitude, vm.selectedCity.longitude));
      vm.map.showInfoWindow('myInfoWindow', this);
    }
    NgMap.getMap().then(function(map) {
		    vm.map = map;
        vm.showCustomMarker = function(evt){
			       console.log('showing marker');
		    }
		    vm.closeCustomMarker= function(evt) {
            this.style.display = 'none';
        };
	  });
    vm.lat = 29.65;
    vm.lng = -82.32;
    vm.changeCenter = changeCenter;

    var g = $(function () {
      $('#datetimepicker1').datetimepicker({
        collapse: false
      });
      $('#datetimepicker2').datetimepicker({
        collapse: false
      });
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        var map = new google.maps.Map(document.getElementById('map'), {
          center: pos,
          zoom: 14
        });

        var current = new google.maps.InfoWindow;
        map.setCenter(pos);
      });
    } else {
      alert('Browser doesn\'t support Geolocation.');
    }

    function changeCenter() {
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({
        'address': vm.newAddress
      }, function (results, status) {
        if (results.length > 0) {
          console.log(results[0].geometry.location.lat());
          vm.lat = results[0].geometry.location.lat();
          vm.lng = results[0].geometry.location.lng();
          var cur = { lat: vm.lat, lng: vm.lng };
          var map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: vm.lat, lng: vm.lng },
            zoom: 14
          });
          var infoWindow = new google.maps.InfoWindow;
          infoWindow.open(map);
        } else {
          alert('Cannot find ' + vm.newAddress);
        }
      });
    }
  }
}());

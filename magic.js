var apiToken = "pk.eyJ1IjoibGZvc2NhcmkiLCJhIjoiY2pxM3V4OHhwMGVnMjQzcG9hZmhjZmlqaSJ9.On_S1zng2BsFLYYTz1Vzwg";

var app = new Vue({
  el: '#app',
  data: {
    address: "",
    alert: "",
    coordinates: [],
    map: null,
    centerMarker: null,
    markers: []
  },
  computed: {
    sanitizedAddress () {
      return this.address.trim().split(' ').join('%20');
    },

    centerPoint () {
      if(this.coordinates[0]) {
        var lat = this.coordinates[0].lat, lng = this.coordinates[0].lng;
        for (var i = 1; i < this.coordinates.length; i++) {
          lat += this.coordinates[i].lat;
          lng += this.coordinates[i].lng;
        }
        lat /= this.coordinates.length;
        lng /= this.coordinates.length;
        return [lat, lng];
      } else {
        return [0, 0];
      }
    }
  },

  methods: {
    getAddress () {
      axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/' + this.sanitizedAddress + '.json?access_token=' + apiToken)
        .then(response => {
          var pos = response.data.features[0].geometry.coordinates;
          var t = {
            name: response.data.features[0].text,
            lat: pos[0],
            lng: pos[1]
          };
          if(!this.isDuplicate(t)) {
            this.coordinates.push(t);
            this.alert = "";
            this.addMarker([t.lat, t.lng])
          } else {
            this.alert = "Duplicate";
          }
        })
        .catch(error => {
          console.log(error);
          this.alert = "Address not found";
        });
      this.address = "";
    },

    removeAddress (info) {
      var i = this.coordinates.indexOf(info);
      if(i == -1) return;
      this.coordinates.splice(i, 1);
      this.markers[i].remove();
      this.setCenterMarker();
    },

    addMarker (info) {
      var marker = new mapboxgl.Marker()
        .setLngLat(info)
        .addTo(this.map);
      this.markers.push(marker);
      this.setCenterMarker();
    },

    setCenterMarker () {
      if(this.centerMarker != null)
        this.centerMarker.remove()
      if(this.coordinates.length > 1) {
        this.centerMarker = new mapboxgl.Marker({ color: '#fcca46' })
          .setLngLat(this.centerPoint)
          .addTo(this.map);
      }
    },

    isDuplicate (info) {
      for (var i = 0; i < this.coordinates.length; i++)
        if(this.coordinates[i].name == info.name)
          return true;
      return false;
    }
  },

  mounted () {
    mapboxgl.accessToken = apiToken;
    this.map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v10",
      doubleClickZoom: true,
      center: [9.1903, 45.4642],
      zoom: 10
    });
    document.querySelector("input").focus();
  }
});

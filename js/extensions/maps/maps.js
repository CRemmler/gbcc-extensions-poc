Maps = (function() {

  var zoom = 9;
  var location = "Austin TX";
  var map;
  var markers = {};
  var viewWidth;
  var viewHeight;
  
  function setupInterface() {
    viewWidth = parseFloat($(".netlogo-canvas").css("width"));
    viewHeight = parseFloat($(".netlogo-canvas").css("height"));
    var spanText = "<div class='map-controls'>";
    spanText +=       "<i id='mapOn' class='fa fa-toggle-on' aria-hidden='true'></i>";
    spanText +=       "<i id='mapOff' class='fa fa-toggle-off' aria-hidden='true'></i>";
    spanText +=    "</div>";
    $(".netlogo-widget-container").append(spanText);
    spanText =    "<div id='mapContainer'></div>";
    $(".netlogo-widget-container").append(spanText);
    $(".map-controls").css("left", parseFloat($(".netlogo-view-container").css("left")) + parseFloat($(".netlogo-canvas").css("width")) + 8 + "px");
    $(".map-controls").css("top", $(".netlogo-view-container").css("top"));
    $("#mapContainer").css("width", parseFloat($(".netlogo-canvas").css("width")) - 5 + "px");
    $("#mapContainer").css("height", parseFloat($(".netlogo-canvas").css("height")) - 4 + "px");
    $("#mapContainer").css("left", $(".netlogo-view-container").css("left"));
    $("#mapContainer").css("top", $(".netlogo-view-container").css("top"));
    $("#mapContainer").css("display", "none");
    map = L.map('mapContainer').setView([0,0], 13);
    setupEventListeners();
  }
  
  function setupEventListeners() {
    $(".map-controls").on("click", "#mapOn", function() {
      updateMap("mapOff");
      triggerMapUpdate();
    });
    $(".map-controls").on("click", "#mapOff", function() {
      updateMap("mapOn");
    });
    $(".netlogo-view-container").css("background-color","transparent"); 
  }
  
  function resetInterface() {
    $("#mapContainer").css("display","inline-block");
    $(".map-controls").css("display","inline-block");
    updateMap("mapOff");
  }
  
  function updateMap(state) {
  //  map.redraw();
    map.invalidateSize();
    if (state === "mapOn") {
      $("#mapOff").removeClass("selected");
      $("#mapOn").addClass("selected");
      $("#mapContainer").addClass("selected");
      $(".netlogo-view-container").css("z-index","0");
      drawPatches = true;
    } else {
      $("#mapOn").removeClass("selected");
      $("#mapOff").addClass("selected");
      $("#mapContainer").removeClass("selected");
      $(".netlogo-view-container").css("z-index","1");
      drawPatches = false;
    }
    world.triggerUpdate();
  }


  function getMapAsString() {

  }
  
  function redrawMap() {

  }
  
  function triggerMapUpdate() {
    if (procedures.gbccOnMapUpdate != undefined) { session.run('gbcc-on-map-update'); }
  }

  function importMap(settings) {
    zoom = settings[0];
    location = settings[1];
    map.setView(location, zoom);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    //Images.clearImage();
    Physics.removePhysics();
    Maps.removeMap();
    Graph.removeGraph();
    world.triggerUpdate();
    redrawMap();
    resetInterface();
  }
  
  function exportMap() {

  }
  
  function createMarker(name, location) {
    var lng = location[0];
    var lat = location[1];
    console.log("create marker",name);
    var newLatLng = new L.LatLng(lat, lng);
    var marker = L.marker(newLatLng).addTo(map);
    markers[name] = marker;
  }
  
  function updateMarker(name, location) {
    console.log("update marker",name,location);
    if (markers[name]) {
      console.log("marker does exist");
      var lng = location[0];
      var lat = location[1];
      var newLatLng = new L.LatLng(lat, lng);
      markers[name].setLatLng(newLatLng); 
    }
  }

  function getMarker(name) {
    console.log("get marker");
    console.log(name);
    if (markers[name]) {
      console.log("does exist");
      var latLng = markers[name].getLatLng();
      var lng = latLng.lng;
      var lat = latLng.lat;
      console.log(lng,lat);
      return [lng, lat];
    } else {
      console.log("does not exist");
      return [ "does not exist" ]
    }
  }
  
  /*

  function setMarkerXY(name, settings) {
    var xcor = settings[0];
    var ycor = settings[1];
    var pixelX = universe.view.xPcorToCanvas(xcor);
    var pixelY = universe.view.yPcorToCanvas(ycor);
    var pixelPercentX = 1 - (pixelX / (viewWidth * 2));
    var pixelPercentY = (pixelY / (viewHeight * 2));
    var boundaries = map.getBounds();
    var boundaryMinX = boundaries._northEast.lng;
    var boundaryMinY = boundaries._northEast.lat;
    var boundaryMaxX = boundaries._southWest.lng;
    var boundaryMaxY = boundaries._southWest.lat;
    var markerX = (pixelPercentX * (boundaryMaxX - boundaryMinX)) + boundaryMinX;
    var markerY = (pixelPercentY * (boundaryMaxY - boundaryMinY)) + boundaryMinY;
    var newLatLng = new L.LatLng(markerY, markerX);
    markers[name].setLatLng(newLatLng); 
  }
  
  function getMarkerXY(name) {
    var markerPosition = markers[name].getPosition();
    var markerPositionX = markerPosition.lng();
    var markerPositionY = markerPosition.lat();
    var boundaries = map.getBounds();
    var boundaryMinX = boundaries._northEast.lng;
    var boundaryMinY = boundaries._northEast.lat;
    var boundaryMaxX = boundaries._southWest.lng;
    var boundaryMaxY = boundaries._southWest.lat;
    var markerPercentX = 1 - ((boundaryMaxX - markerPositionX) / (boundaryMaxX - boundaryMinX));
    var markerPercentY = (boundaryMaxY - markerPositionY) / (boundaryMaxY - boundaryMinY);
    var pixelX = markerPercentX * viewWidth;
    var pixelY = markerPercentY * viewHeight;
    var patchXcor = universe.view.xPixToPcor(pixelX);
    var patchYcor = universe.view.yPixToPcor(pixelY);
    return ([patchXcor, patchYcor]);
  }
  
  function setMarkerLngLat(name, settings) {
    var lng = settings[0];
    var lat = settings[1];
    var newLatLng = new L.LatLng(lng, lat);
    markers[name].setLatLng(newLatLng); 
  }
  
  function getMarkerLngLat(name) {
    var markerPosition = markers[name].getLatLng();
    return ([markerPosition.lng, markerPosition.lat]);
  }
  */
  function removeMarker(name) {
    map.removeLayer(markers[marker]);
  }
  
  function removeMap() {
    $(".map-controls").css("display","none");
    $("#mapContainer").css("display","none");
    for (marker in markers) {
      removeMarker(name);
    }
    updateMap("mapOn");
  }
  
  // for testing 
  function getMap() {
    return map;
  }
  
  function getMarkers() {
    return markers;
  }
  
  function patchToLnglat(coords) {
    var xcor = coords[0];
    var ycor = coords[1];
    var pixelX = universe.view.xPcorToCanvas(xcor);
    var pixelY = universe.view.yPcorToCanvas(ycor);
    var pixelPercentX = 1 - (pixelX / (viewWidth * 2));
    var pixelPercentY = (pixelY / (viewHeight * 2));
    var boundaries = map.getBounds();
    var boundaryMinX = boundaries._northEast.lng;
    var boundaryMinY = boundaries._northEast.lat;
    var boundaryMaxX = boundaries._southWest.lng;
    var boundaryMaxY = boundaries._southWest.lat;
    var markerX = (pixelPercentX * (boundaryMaxX - boundaryMinX)) + boundaryMinX;
    var markerY = (pixelPercentY * (boundaryMaxY - boundaryMinY)) + boundaryMinY;
    return ([markerX, markerY]);
  }
  
  function lnglatToPatch(coords) {
    var markerPositionX = coords[0];
    var markerPositionY = coords[1];
    var boundaries = map.getBounds();
    var boundaryMaxX = boundaries._northEast.lng;
    var boundaryMaxY = boundaries._northEast.lat;
    var boundaryMinX = boundaries._southWest.lng;
    var boundaryMinY = boundaries._southWest.lat;
    console.log(coords);
    console.log(boundaries);
    if ( markerPositionX < boundaryMinX 
      || markerPositionX > boundaryMaxX
      || markerPositionY < boundaryMinY
      || markerPositionY > boundaryMaxY) {
        console.log("out of bounds");
      return (["out of bounds"]);
    }
    console.log("in bounds");
    var markerPercentX = 1 - ((boundaryMaxX - markerPositionX) / (boundaryMaxX - boundaryMinX));
    var markerPercentY = (boundaryMaxY - markerPositionY) / (boundaryMaxY - boundaryMinY);
    var pixelX = markerPercentX * viewWidth;
    var pixelY = markerPercentY * viewHeight;
    var patchXcor = universe.view.xPixToPcor(pixelX);
    var patchYcor = universe.view.yPixToPcor(pixelY);
    return ([patchXcor, patchYcor]);
  }
  
  return {
    setupInterface: setupInterface,
    importMap: importMap,
    createMarker: createMarker,
    removeMarker: removeMarker,
    updateMarker: updateMarker,
    getMap: getMap,
    getMarkers, getMarkers,
    exportMap: exportMap,
    redrawMap: redrawMap,
    //getMarkerXY: getMarkerXY,
    //setMarkerXY: setMarkerXY,
    //getMarkerLngLat: getMarkerLngLat,
    //setMarkerLngLat: setMarkerLngLat,
    getMapAsString: getMapAsString,
    patchToLnglat: patchToLnglat,
    lnglatToPatch: lnglatToPatch,
    removeMap: removeMap,
    getMarker: getMarker
  };
 
})();

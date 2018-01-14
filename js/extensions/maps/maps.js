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
  
  function broadcastMap(key) {
    /*
    html2canvas($("#mapContainer"), {
      useCORS: true,
         onrendered: function(canvas) {
             message = canvas.toDataURL("image/png");
             socket.emit("send reporter", {
               hubnetMessageSource: "all-users", 
               hubnetMessageTag: "canvas-view-"+key, 
               hubnetMessage: message
             }); 
            //document.body.appendChild(canvas);
         }
     });    */
     
     html2canvas(document.getElementById("mapContainer"), {
    useCORS: true
    }).then(function (canvas) {
      message = canvas.toDataURL("image/png");
      socket.emit("send reporter", {
        hubnetMessageSource: "all-users", 
        hubnetMessageTag: "canvas-view-"+key, 
        hubnetMessage: message
      }); 
     //document.body.appendChild(canvas);
        //document.body.appendChild(canvas);
    })
     

     
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
    Physics.clearWorld();
    Maps.clearMap();
    Graph.clearGraph();
    world.triggerUpdate();
    redrawMap();
    resetInterface();
  }
  
  function exportMap() {

  }
  
  function createMarker(name, settings) {
    var marker = L.marker([0, 0]).addTo(map);
    markers[name] = marker;
  }

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
  
  function removeMarker(name) {
    map.removeLayer(markers[marker]);
  }
  
  function clearMap() {
    $(".map-controls").css("display","none");
    $("#mapContainer").css("display","none");
    for (marker in markers) {
      removeMarker(name);
    }
  }
  
  // for testing 
  function getMap() {
    return map;
  }
  
  function getMarkers() {
    return markers;
  }
  
  return {
    setupInterface: setupInterface,
    importMap: importMap,
    createMarker: createMarker,
    removeMarker: removeMarker,
    clearMap: clearMap,
    getMap: getMap,
    getMarkers, getMarkers,
    exportMap: exportMap,
    redrawMap: redrawMap,
    getMarkerXY: getMarkerXY,
    setMarkerXY: setMarkerXY,
    getMarkerLngLat: getMarkerLngLat,
    setMarkerLngLat: setMarkerLngLat,
    getMapAsString: getMapAsString,
    broadcastMap: broadcastMap
  };
 
})();

// Static Maps Dev guide
// https://developers.google.com/maps/documentation/static-maps/intro#Markers

// Google Maps API 
// https://developers.google.com/maps/documentation/javascript/reference

Maps = (function() {

  var zoom = 9;
  var location = "Austin TX";
  var map;
  var markers = {};
  var viewWidth;
  var viewHeight;
  
  function setupInterface() {
    viewWidth = $(".netlogo-canvas").css("width");
    viewHeight = $(".netlogo-canvas").css("height");
    $("body").append("<div id='map' style='height:"+viewHeight+";width:"+viewWidth+";position:absolute; top: 0px; visibility:hidden;'></div>");
    var uluru = {lat: 30.307182, lng: -97.755996};
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: zoom,
      center: uluru
    });
    var marker = new google.maps.Marker({
      position: uluru,
      map: map
    });
    
    spanText = "<div class='maps-controls'>";
    //left controls
    spanText += "<div class='maps-controls-left'>";
    //search
    spanText += "  <div class='maps-search'>";
    spanText += "    <span id='mapsSearch'><input id='mapsSearchInputtype='text'> <i class='fa fa-search' aria-hidden='true'></i></span>";
    spanText += "  </div>";
    spanText += "</div>";
    //right controls
    spanText += "<div class='maps-controls-right'>";
    //zoom
    spanText += "  <div class='maps-zoom'>";
    spanText += "    <span id='mapsZoomOut'><i class='fa fa-plus' aria-hidden='true'></i></span>";
    spanText += "    <span class='inactive'> | </span>";
    spanText += "    <span id='mapsZoomIn'><i class='fa fa-minus' aria-hidden='true'></i></span>";
    spanText += "  </div>";
    //span 
    spanText += "  <div class='maps-pan'>";
    spanText += "    <span id='mapsPanUp'><i class='fa fa-chevron-up' aria-hidden='true'></i></span><br>";
    spanText += "    <span id='mapsPanLeft'><i class='fa fa-chevron-left' aria-hidden='true'></i></span>";
    spanText += "    <span> <i class='fa fa-plus inactive' aria-hidden='true'></i> </span>";
    spanText += "    <span id='mapsPanRight'><i class='fa fa-chevron-right' aria-hidden='true'></i></span><br>";
    spanText += "    <span id='mapsPanDown'><i class='fa fa-chevron-down' aria-hidden='true'></i></span>";
    spanText += "  </div>";  
    spanText += "</div>";  
    spanText += "</div>";
    $(".netlogo-view-container").append(spanText);
    var leftOffset = (Math.round($(".netlogo-view-container").css("width").replace("px","")) - 55) + "px";
    $(".maps-controls-right").css("left",leftOffset);
    $(".maps-controls").css("display","none");
    setupEventListeners();
  }
  
  function setupEventListeners() {
    $(".maps-controls").on("click", "#mapsSearch", function() {
      location = $("#mapsSearch input").val();
      var searchUrl = "https://maps.googleapis.com/maps/api/geocode/json?address="+location+"&key=AIzaSyDP3gg3Bp6UZBJnDx20Kk4c7FIfcF-z5e4";
      $.get( searchUrl, function( data ) {
        var locationCoords = data.results[0].geometry.location;
        map.setCenter(locationCoords);
      });
      redrawMap();
    });
    $(".maps-controls").on("click", "#mapsZoomIn", function() {
      zoom--;
      map.setZoom(zoom);
      redrawMap();
    });
    $(".maps-controls").on("click", "#mapsZoomOut", function() {
      zoom++;
      map.setZoom(zoom);
      redrawMap();
    });
    $(".maps-controls").on("click", "#mapsPanUp", function() {
      map.panBy(0, -50);
      redrawMap();
    });
    $(".maps-controls").on("click", "#mapsPanDown", function() {
      map.panBy(0, 50);
      redrawMap();
    });
    $(".maps-controls").on("click", "#mapsPanLeft", function() {
      map.panBy(-50, 0);
      redrawMap();
    });
    $(".maps-controls").on("click", "#mapsPanRight", function() {
      map.panBy(50, 0);
      redrawMap();
    });
  }
  
  function resetInterface() {
    $(".maps-controls").css("display","inline-block");    
  }
  
  function getMapAsString() {
    var center = map.getCenter();
    location = center.lat()+","+center.lng();
    
    var src = "https://maps.googleapis.com/maps/api/staticmap?";
    src += "center="+location;
    src += "&zoom="+zoom;
    src += "&scale=1";
    src += "&size="+viewWidth.replace("px","")+"x"+viewHeight.replace("px","");
    //&maptype=roadmap&format=png&visual_refresh=true';  
    src += "&maptype=roadmap";
    src += "&format=png&visual_refresh=true";
    return src;
  }
  
  function redrawMap() {
    var src = getMapAsString();
    var image = new Image();
    image.onload = function() {
      $("#imageLayer").prop("src",src);
      world.triggerUpdate();
    };
    image.src = src;
    triggerMapUpdate();
  }
  
  function triggerMapUpdate() {
    if (procedures.gbccOnMapUpdate != undefined) { session.run('gbcc-on-map-update'); }
  }

  function importMap(settings) {
    zoom = settings[0];
    location = settings[1];
    //Images.clearImage();
    Physics.clearWorld();
    Maps.clearMap();
    Graph.clearGraph();
    world.triggerUpdate();
    redrawMap();
    resetInterface();
  }
  
  function exportMap() {
    var result = [];
    result.push(zoom);
    var center = map.getCenter();
    result.push([center.lng(), center.lat()]);
    return result;
  }
  
  function createMarker(name, settings) {
    var lat = 0;//settings[0];
    var lng = 0;//settings[1];
    var marker = new google.maps.Marker({
      position: {lat: lat, lng: lng},
      map: map,
      title: 'Hello World!'
    });
    markers[name] = marker;
    //redrawMap();
  }

  function setMarkerXY(name, settings) {
    var xcor = settings[0];
    var ycor = settings[1];
    var pixelX = universe.view.xPcorToCanvas(xcor);
    var pixelY = universe.view.yPcorToCanvas(ycor);
    var pixelPercentX = (pixelX / (viewWidth.replace("px","") * 2));
    var pixelPercentY = 1 - (pixelY / (viewHeight.replace("px","") * 2));
    var boundaries = map.getBounds();
    var boundaryMinX = boundaries.b.b;
    var boundaryMinY = boundaries.f.b;
    var boundaryMaxX = boundaries.b.f;
    var boundaryMaxY = boundaries.f.f;
    var markerX = (pixelPercentX * (boundaryMaxX - boundaryMinX)) + boundaryMinX;
    var markerY = (pixelPercentY * (boundaryMaxY - boundaryMinY)) + boundaryMinY;
    markers[name].setPosition({lng: markerX, lat: markerY});    
  }
  function getMarkerXY(name) {
    var markerPosition = markers[name].getPosition();
    var markerPositionX = markerPosition.lng();
    var markerPositionY = markerPosition.lat();
    var boundaries = map.getBounds();
    var boundaryMinX = boundaries.b.b;
    var boundaryMinY = boundaries.f.b;
    var boundaryMaxX = boundaries.b.f;
    var boundaryMaxY = boundaries.f.f;
    var markerPercentX = 1 - ((boundaryMaxX - markerPositionX) / (boundaryMaxX - boundaryMinX));
    var markerPercentY = (boundaryMaxY - markerPositionY) / (boundaryMaxY - boundaryMinY);
    var pixelX = markerPercentX * viewWidth.replace("px","");
    var pixelY = markerPercentY * viewHeight.replace("px","");
    var patchXcor = universe.view.xPixToPcor(pixelX);
    var patchYcor = universe.view.yPixToPcor(pixelY);
    return ([patchXcor, patchYcor]);
  }
  function setMarkerLngLat(name, settings) {
    var lng = settings[0];
    var lat = settings[1];
    markers[name].setPosition({lat: lat, lng: lng});
  }
  
  function getMarkerLngLat(name) {
    var markerPosition = markers[name].getPosition();
    return ([markerPosition.lng(), markerPosition.lat()]);
  }
  
  function removeMarker(name) {
    markers[name].setMap(null);
    delete markers[name];
  }
  
  function clearMap() {
    $(".maps-controls").css("display","none");
    for (m in markers) {
      removeMarker[m];
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
    getMapAsString: getMapAsString
  };
 
})();
